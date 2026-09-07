import Booking from "../models/Booking.js"
import Car from "../models/Car.js";
import transporter from "../config/nodemailer.js";
import razorpayInstance from "../config/razorpay.js";
import nodemailer from "nodemailer"
import logger from "../config/logger.js"
import mongoose from "mongoose";
import crypto from "crypto";
import { generateBookingReceipt } from "../services/pdfService.js";
import { createNotification } from "../services/notificationService.js";
import Payment from "../models/Payment.js";

const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        status: { $ne: "cancelled" },
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
    })
    return bookings.length === 0;
}

export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;
        const cars = await Car.find({ location, isAvailable: true })

        const availableCarsPromise = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, returnDate)
            return { ...car._doc, isAvailable: isAvailable }
        })
        let availableCars = await Promise.all(availableCarsPromise);
        availableCars = availableCars.filter(car => car.isAvailable === true)
        res.json({ success: true, availableCars })
    }
    catch (error) {
        res.json({ message: error.message, success: false })
    }
}

const withRetry = async (fn, retries = 3) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError') || error.code === 112 || error.code === 251) {
                lastError = error;
                const backoff = Math.pow(2, i) * 100 + Math.random() * 50;
                await new Promise(resolve => setTimeout(resolve, backoff));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate, paymentId, paymentType, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const idempotencyKey = req.headers['idempotency-key'];

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        if (returned <= picked) {
            return res.json({ success: false, message: "Return date must be after pickup date" });
        }

        const carData = await Car.findById(car);
        if (!carData) {
            return res.json({ success: false, message: "Car not found" });
        }

        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        const price = carData.pricePerDay * noOfDays;

        if (idempotencyKey) {
             const existingBooking = await Booking.findOne({ idempotencyKey });
             if (existingBooking) {
                 return res.json({ success: true, message: "Booking already created via idempotency key" });
             }
        }

        let paymentStatus = "pending";
        let bookingStatus = "pending_payment";
        let paymentMethod = paymentId === "PAY_LATER" ? "PAY_LATER" : "ONLINE";

        // Signature Verification for Online Payments
        if (paymentMethod === "ONLINE") {
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                 return res.status(400).json({ success: false, message: "Missing Razorpay details for online payment" });
            }
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                            .update(body.toString())
                                            .digest('hex');
            
            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ success: false, message: "Invalid payment signature" });
            }
            paymentStatus = "paid";
            bookingStatus = "confirmed";
        } else {
            paymentStatus = "pending";
            bookingStatus = "confirmed";
        }

        const newBookingId = new mongoose.Types.ObjectId();
        const newPaymentId = new mongoose.Types.ObjectId();

        const bookingResult = await withRetry(async () => {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                // Atomic availability lock
                const updatedCar = await Car.findOneAndUpdate(
                    {
                        _id: car,
                        isAvailable: true,
                        reservedSlots: {
                            $not: {
                                $elemMatch: {
                                    pickupDate: { $lt: returned },
                                    returnDate: { $gt: picked }
                                }
                            }
                        }
                    },
                    {
                        $push: { 
                            reservedSlots: { pickupDate: picked, returnDate: returned, bookingId: newBookingId }
                        }
                    },
                    { new: true, session }
                );

                if (!updatedCar) {
                    throw new Error("Car is not available for the selected dates");
                }

                // Create the booking record
                const booking = await Booking.create([{
                    _id: newBookingId,
                    car,
                    owner: carData.owner,
                    user: _id,
                    pickupDate,
                    returnDate,
                    price,
                    paymentId: razorpay_payment_id || "PAY_LATER",
                    paymentStatus,
                    status: bookingStatus,
                    idempotencyKey
                }], { session });

                // Create Payment record
                await Payment.create([{
                    _id: newPaymentId,
                    booking: newBookingId,
                    user: _id,
                    orderId: razorpay_order_id || `PAY_LATER_${Date.now()}`,
                    paymentId: razorpay_payment_id,
                    amount: price,
                    status: paymentStatus === "paid" ? "PAID" : "PENDING",
                    method: paymentMethod,
                    paidAt: paymentStatus === "paid" ? new Date() : null
                }], { session });

                await session.commitTransaction();
                return booking[0];
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        });

        logger.info("booking.created", { bookingId: bookingResult._id, carId: car, userId: _id });

        // Post-booking operations: PDF, Notifications, Email (outside transaction so failure doesn't rollback booking)
        try {
            // Populate necessary fields for PDF
            const populatedBooking = await Booking.findById(bookingResult._id).populate('user').populate('car');
            
            // Generate PDF
            const pdfBuffer = await generateBookingReceipt(populatedBooking);
            populatedBooking.receiptGenerated = true;
            populatedBooking.receiptGeneratedAt = new Date();
            await populatedBooking.save();

            // Create notification and send email
            await createNotification({
                user: _id,
                type: bookingStatus === "confirmed" ? "BOOKING_CONFIRMED" : "BOOKING_CREATED",
                title: "Booking Confirmed",
                message: `Your booking for ${carData.brand} ${carData.model} is confirmed.`,
                booking: bookingResult._id,
                sendEmail: true,
                emailData: {
                    to: req.user.email,
                    subject: "Booking Request Submitted 🚗",
                    html: `
                        <h1>Booking Request Submitted</h1>
                        <p>Your booking has been successfully processed.</p>
                        <p>Car: ${carData.brand} ${carData.model}</p>
                        <p>Pickup Date: ${new Date(pickupDate).toLocaleDateString()}</p>
                        <p>Return Date: ${new Date(returnDate).toLocaleDateString()}</p>
                        <p>Total Price: ₹${price}</p>
                        <p>Payment Status: ${paymentStatus.toUpperCase()}</p>
                        <p>Please find your receipt attached.</p>
                    `,
                    attachments: [{
                        filename: `CarRental_Booking_${bookingResult._id}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }]
                }
            });

        } catch (postError) {
            logger.error("booking.post_operations_failed", { error: postError.message });
            // We DO NOT rollback the booking here, it's already successfully created.
        }

        res.json({ success: true, message: "Booking Created", bookingId: bookingResult._id });
    } catch (error) {
         if (error.message === "Car is not available for the selected dates") {
             return res.status(400).json({ success: false, message: error.message });
         }
         if (error.code === 11000 && error.keyPattern && error.keyPattern.idempotencyKey) {
              return res.json({ success: true, message: "Booking already created (idempotency caught)." });
         }
         
         logger.error("booking.creation_failed", { error: error.message });
         res.status(500).json({ success: false, message: error.message });
    }
}

export const getUserBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const booking = await Booking.find({ user: _id }).populate('car').sort({ createdAt: -1 })
        res.json({ success: true, booking })
    }
    catch (error) {
        res.json({ message: error.message, success: false })
    }
}

export const getOwnerBooking = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.json({ success: false, message: "Not Authorized" })
        }

        const booking = await Booking.find({ owner: req.user._id }).populate('car user').select("-user.password").sort({ createdAt: -1 })
        res.json({ success: true, booking })
    }
    catch (error) {
        res.json({ message: error.message, success: false })
    }
}

export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId).populate('car').populate('user');

        if (!booking) {
            return res.json({ success: false, message: "Booking not found" })
        }

        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" })
        }
        booking.status = status;
        await booking.save();

        logger.info(`booking.status_changed`, {
            bookingId,
            status
        });

        if (status === "confirmed") {
            await sendemail(
                booking.user.email,
                "Booking Confirmed 🚗",
                `
                    <h1>Booking Confirmed</h1>
                    <p>Your booking has been confirmed.</p>
                    <p>Car: ${booking.car.brand} ${booking.car.model}</p>
                    <p>Pickup Date: ${new Date(booking.pickupDate).toLocaleDateString()}</p>
                    <p>Return Date: ${new Date(booking.returnDate).toLocaleDateString()}</p>
                    <p>Total Price: ₹${booking.price}</p>
                `
            );
        }
        if (status === "cancelled") {
            await sendemail(
                booking.user.email,
                "Booking Cancelled 🚗",
                `
                    <h1>Booking Cancelled</h1>
                    <p>Your booking has been cancelled.</p>
                    <p>Car: ${booking.car.brand} ${booking.car.model}</p>
                    <p>Pickup Date: ${new Date(booking.pickupDate).toLocaleDateString()}</p>
                    <p>Return Date: ${new Date(booking.returnDate).toLocaleDateString()}</p>
                    <p>Total Price: ₹${booking.price}</p>
                `
            );
        }
        res.json({ success: true, message: "Status Updated" })
    }
    catch (error) {
        res.json({ message: error.message, success: false })
    }
}

export const deleteBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" })
        }
        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        await Booking.findByIdAndDelete(bookingId);
        logger.info("booking.deleted", { bookingId });
        res.json({ success: true, message: "Booking Deleted" })
    }
    catch (error) {
        res.json({ message: error.message, success: false })
    }
}

export const sendemail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        })
        logger.info("email.sent", { to, subject });
    }
    catch (error) {
        logger.error("email.failed", { error: error.message, to, subject });
    }
}

export const getCarBooking = async (req, res) => {
    try {

        const bookings = await Booking.find({
            car: req.params.id,
            status: { $ne: "cancelled" }
        }).populate('user', '-password').sort({ createdAt: -1 })
        res.json({ success: true, bookings })
    }
    catch (error) {
        res.json({ message: error.message, success: false })
    }
}
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    logger.info("payment.order_creation_started", { amount });
    
    // We use your already-configured instance from your config file here!
    const order = await razorpayInstance.orders.create(options);
    
    logger.info("payment.order_created", { orderId: order.id });
    res.json({ success: true, order });

  } catch (error) {
    const errorMsg = error?.error?.description || error.message || "Razorpay API Failed";
    logger.error("payment.failed", { error: errorMsg });
    
    res.json({ success: false, message: errorMsg });
  }
};

export const downloadReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, role } = req.user;

        const booking = await Booking.findById(id).populate('user').populate('car');

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Authorization check: only the booking user or the car owner or admin can download
        if (booking.user._id.toString() !== _id.toString() && booking.owner.toString() !== _id.toString() && role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized to access this receipt" });
        }

        const pdfBuffer = await generateBookingReceipt(booking);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CarRental_Booking_${booking._id}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        return res.send(pdfBuffer);
    } catch (error) {
        logger.error("receipt.download_failed", { error: error.message });
        res.status(500).json({ success: false, message: "Failed to generate receipt" });
    }
};