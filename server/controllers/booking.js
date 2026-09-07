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
import { calculatePaymentDeadline, isDeadlineExpired, formatDeadlineForDisplay } from "../utils/deadline.js";
import { cancelExpiredUnpaidBookings } from "../services/cancellationService.js";
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

// Server-authoritative rental pricing calculation helper
export const calculateRentalPricing = async (carId, pickupDateStr, returnDateStr) => {
    if (!carId) {
        throw new Error("Car ID is required");
    }
    if (!pickupDateStr || !returnDateStr) {
        throw new Error("Both pickup date and return date are required");
    }

    const picked = new Date(pickupDateStr);
    const returned = new Date(returnDateStr);

    if (isNaN(picked.getTime()) || isNaN(returned.getTime())) {
        throw new Error("Invalid date format provided for rental schedule");
    }

    // Set time to start of day for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pickedDay = new Date(picked);
    pickedDay.setHours(0, 0, 0, 0);

    if (pickedDay < today) {
        throw new Error("Pickup date cannot be in the past");
    }

    if (returned <= picked) {
        throw new Error("Return date must be strictly after pickup date");
    }

    const carData = await Car.findById(carId);
    if (!carData) {
        throw new Error("Car not found in fleet database");
    }

    // Calculate rental days (minimum 1 day)
    const diffTime = returned.getTime() - picked.getTime();
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const pricePerDay = Number(carData.pricePerDay);
    if (isNaN(pricePerDay) || pricePerDay <= 0) {
        throw new Error("Invalid vehicle daily rate configured on server");
    }

    const finalPrice = days * pricePerDay;
    const amountPaise = Math.round(finalPrice * 100);

    return {
        carData,
        picked,
        returned,
        days,
        pricePerDay,
        finalPrice,
        amountPaise
    };
};

export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { 
            car, 
            carId,
            pickupDate, 
            returnDate, 
            paymentId, 
            paymentType, 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature 
        } = req.body;
        const idempotencyKey = req.headers['idempotency-key'];

        const targetCarId = car || carId;

        // 1. Server-authoritative calculation and validation
        const pricing = await calculateRentalPricing(targetCarId, pickupDate, returnDate);

        // 2. Prevent duplicate payment processing & check idempotency
        if (razorpay_payment_id && razorpay_payment_id !== "PAY_LATER") {
            const existingPaymentBooking = await Booking.findOne({ paymentId: razorpay_payment_id });
            if (existingPaymentBooking) {
                return res.json({ 
                    success: true, 
                    message: "Booking already processed for this payment transaction.",
                    bookingId: existingPaymentBooking._id,
                    idempotent: true
                });
            }
        }

        if (idempotencyKey) {
            const existingBooking = await Booking.findOne({ idempotencyKey });
            if (existingBooking) {
                return res.json({ 
                    success: true, 
                    message: "Booking already created via idempotency key",
                    bookingId: existingBooking._id,
                    idempotent: true
                });
            }
        }

        let paymentStatus = "pending";
        let bookingStatus = "confirmed";
        const isOnlinePayment = Boolean(
            (razorpay_payment_id && razorpay_payment_id !== "PAY_LATER") || 
            (paymentType === "PAY_NOW")
        );
        const paymentMethod = isOnlinePayment ? "ONLINE" : "PAY_LATER";
        const paymentDeadline = !isOnlinePayment ? calculatePaymentDeadline(pricing.picked) : null;

        // 3. Cryptographic Signature Verification for Online Payments
        if (paymentMethod === "ONLINE") {
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Missing Razorpay verification details (order ID, payment ID, or signature)" 
                });
            }
            
            const body = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');
            
            if (expectedSignature !== razorpay_signature) {
                logger.error("payment.signature_mismatch", { razorpay_order_id, razorpay_payment_id });
                return res.status(400).json({ success: false, message: "Invalid payment signature. Verification failed." });
            }
            
            paymentStatus = "paid";
            bookingStatus = "confirmed";
        } else {
            paymentStatus = "pending";
            bookingStatus = "confirmed";
        }

        const newBookingId = new mongoose.Types.ObjectId();
        const newPaymentId = new mongoose.Types.ObjectId();

        // 4. Atomic Booking & Reservation Transaction with retry
        const bookingResult = await withRetry(async () => {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                // Atomic availability lock: check that no overlapping slot exists
                const updatedCar = await Car.findOneAndUpdate(
                    {
                        _id: targetCarId,
                        isAvailable: true,
                        reservedSlots: {
                            $not: {
                                $elemMatch: {
                                    pickupDate: { $lt: pricing.returned },
                                    returnDate: { $gt: pricing.picked }
                                }
                            }
                        }
                    },
                    {
                        $push: { 
                            reservedSlots: { 
                                pickupDate: pricing.picked, 
                                returnDate: pricing.returned, 
                                bookingId: newBookingId 
                            }
                        }
                    },
                    { new: true, session }
                );

                if (!updatedCar) {
                    throw new Error("Car is not available for the selected dates");
                }

                // Create the booking record with authoritative server price & deadline
                const booking = await Booking.create([{
                    _id: newBookingId,
                    car: targetCarId,
                    owner: pricing.carData.owner,
                    user: _id,
                    pickupDate: pricing.picked,
                    returnDate: pricing.returned,
                    price: pricing.finalPrice,
                    paymentId: isOnlinePayment ? razorpay_payment_id : "PAY_LATER",
                    paymentStatus,
                    status: bookingStatus,
                    paymentDeadline,
                    idempotencyKey
                }], { session });

                // Create Payment record
                await Payment.create([{
                    _id: newPaymentId,
                    booking: newBookingId,
                    user: _id,
                    orderId: razorpay_order_id || `PAY_LATER_${Date.now()}`,
                    paymentId: isOnlinePayment ? razorpay_payment_id : undefined,
                    amount: pricing.finalPrice,
                    currency: "INR",
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

        logger.info("booking.created_successfully", { bookingId: bookingResult._id, carId: targetCarId, userId: _id, price: pricing.finalPrice });

        // 5. Post-booking operations: PDF, Notifications, Email (outside transaction so failure doesn't rollback booking)
        try {
            const populatedBooking = await Booking.findById(bookingResult._id).populate('user').populate('car');
            
            const pdfBuffer = await generateBookingReceipt(populatedBooking);
            populatedBooking.receiptGenerated = true;
            populatedBooking.receiptGeneratedAt = new Date();
            await populatedBooking.save();

            await createNotification({
                user: _id,
                type: bookingStatus === "confirmed" ? "BOOKING_CONFIRMED" : "BOOKING_CREATED",
                title: "Booking Confirmed",
                message: `Your booking for ${pricing.carData.brand} ${pricing.carData.model} is confirmed.`,
                booking: bookingResult._id,
                sendEmail: true,
                emailData: {
                    to: req.user.email,
                    subject: "Booking Request Submitted 🚗",
                    html: `
                        <h1>Booking Confirmed</h1>
                        <p>Your booking has been successfully processed.</p>
                        <p>Car: ${pricing.carData.brand} ${pricing.carData.model}</p>
                        <p>Pickup Date: ${pricing.picked.toLocaleDateString()}</p>
                        <p>Return Date: ${pricing.returned.toLocaleDateString()}</p>
                        <p>Total Price: ₹${pricing.finalPrice}</p>
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
        }

        res.status(201).json({ 
            success: true, 
            message: "Booking Created Successfully", 
            bookingId: bookingResult._id 
        });
    } catch (error) {
         if (error.message === "Car is not available for the selected dates") {
             return res.status(409).json({ success: false, message: error.message });
         }
         if (error.message.includes("date") || error.message.includes("Car ID") || error.message.includes("Car not found")) {
             return res.status(400).json({ success: false, message: error.message });
         }
         if (error.code === 11000 && error.keyPattern && error.keyPattern.idempotencyKey) {
              return res.json({ success: true, message: "Booking already created (idempotency caught)." });
         }
         
         logger.error("booking.creation_failed", { error: error.message });
         res.status(500).json({ success: false, message: error.message || "Failed to create booking" });
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
        const { _id, role } = req.user;
        const { bookingId, status } = req.body;

        if (!bookingId || !status) {
            return res.status(400).json({ success: false, message: "Booking ID and new status are required" });
        }

        const validStatuses = ["pending", "pending_payment", "confirmed", "active", "completed", "cancelled", "expired"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status '${status}'` });
        }

        const booking = await Booking.findById(bookingId).populate('car').populate('user');
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Authorization check: Only vehicle owner or admin can change arbitrary statuses; Renter can request cancellation
        const isOwner = booking.owner.toString() === _id.toString();
        const isRenter = booking.user._id.toString() === _id.toString();
        const isAdmin = role === 'admin';

        if (!isOwner && !isAdmin && !(isRenter && status === 'cancelled')) {
            return res.status(403).json({ success: false, message: "Unauthorized to change this booking status" });
        }

        // State Machine validation
        const allowedTransitions = {
            pending: ["confirmed", "cancelled"],
            pending_payment: ["confirmed", "cancelled"],
            confirmed: ["active", "cancelled", "completed"],
            active: ["completed", "cancelled"],
            completed: [],
            cancelled: [],
            expired: []
        };

        const currentStatus = booking.status;
        if (currentStatus === status) {
            return res.json({ success: true, message: `Booking status is already ${status}`, booking });
        }

        const validNextStates = allowedTransitions[currentStatus] || [];
        if (!validNextStates.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid status transition: Cannot change booking from '${currentStatus}' to '${status}'` 
            });
        }

        booking.status = status;
        await booking.save();

        // If booking is cancelled, clean up the reserved slot so the vehicle becomes available again
        if (status === "cancelled") {
            await Car.findByIdAndUpdate(booking.car._id || booking.car, {
                $pull: { reservedSlots: { bookingId: booking._id } }
            });
            logger.info("car.slot_released_on_cancellation", { bookingId: booking._id, carId: booking.car._id || booking.car });
        }

        logger.info(`booking.status_changed`, {
            bookingId,
            oldStatus: currentStatus,
            newStatus: status,
            changedBy: _id
        });

        // Notifications & Emails
        if (status === "confirmed") {
            await createNotification({
                user: booking.user._id,
                type: "BOOKING_CONFIRMED",
                title: "Reservation Confirmed",
                message: `Your booking for ${booking.car.brand} ${booking.car.model} is now confirmed.`,
                booking: booking._id,
                sendEmail: true,
                emailData: {
                    to: booking.user.email,
                    subject: "Booking Confirmed 🚗",
                    html: `
                        <h2>Booking Confirmed</h2>
                        <p>Your booking has been confirmed by the fleet manager.</p>
                        <p><strong>Vehicle:</strong> ${booking.car.brand} ${booking.car.model}</p>
                        <p><strong>Pickup:</strong> ${new Date(booking.pickupDate).toLocaleDateString()}</p>
                        <p><strong>Return:</strong> ${new Date(booking.returnDate).toLocaleDateString()}</p>
                        <p><strong>Total Price:</strong> ₹${booking.price}</p>
                    `
                }
            }).catch(e => logger.error("notification.failed", { error: e.message }));
        }

        if (status === "cancelled") {
            await createNotification({
                user: booking.user._id,
                type: "BOOKING_CANCELLED",
                title: "Reservation Cancelled",
                message: `Your reservation for ${booking.car.brand} ${booking.car.model} has been cancelled.`,
                booking: booking._id,
                sendEmail: true,
                emailData: {
                    to: booking.user.email,
                    subject: "Booking Cancelled 🚗",
                    html: `
                        <h2>Booking Cancelled</h2>
                        <p>Your reservation for ${booking.car.brand} ${booking.car.model} has been cancelled.</p>
                        <p><strong>Dates:</strong> ${new Date(booking.pickupDate).toLocaleDateString()} to ${new Date(booking.returnDate).toLocaleDateString()}</p>
                        <p>If you made an online payment, our fleet support team will assist with reconciliation.</p>
                    `
                }
            }).catch(e => logger.error("notification.failed", { error: e.message }));
        }

        res.json({ success: true, message: `Status updated to ${status}`, booking });
    }
    catch (error) {
        logger.error("booking.change_status_failed", { error: error.message });
        res.status(500).json({ message: error.message, success: false });
    }
};

// Safe cancellation: Paid/historical bookings are never physically destroyed to preserve audit trails
export const deleteBooking = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const isOwner = booking.owner.toString() === _id.toString();
        const isRenter = booking.user.toString() === _id.toString();
        const isAdmin = role === 'admin';

        if (!isOwner && !isRenter && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized to cancel this booking" });
        }

        // Release the reserved slot from vehicle inventory
        await Car.findByIdAndUpdate(booking.car, {
            $pull: { reservedSlots: { bookingId: booking._id } }
        });

        // Set status to cancelled to preserve payment and financial records
        booking.status = "cancelled";
        await booking.save();

        logger.info("booking.cancelled_safely", { bookingId, requestedBy: _id });
        res.json({ success: true, message: "Booking cancelled and inventory slot released successfully" });
    }
    catch (error) {
        logger.error("booking.cancellation_failed", { error: error.message });
        res.status(500).json({ message: error.message, success: false });
    }
};

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
    const targetCarId = req.body.carId || req.body.car;
    const { pickupDate, returnDate } = req.body;

    if (!targetCarId || !pickupDate || !returnDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Vehicle ID, pickup date, and return date are required to initiate payment." 
      });
    }

    // 1. Calculate server-authoritative price
    const pricing = await calculateRentalPricing(targetCarId, pickupDate, returnDate);

    // 2. Pre-check slot availability
    const isAvailable = await checkAvailability(pricing.carData._id, pricing.picked, pricing.returned);
    if (!isAvailable) {
      return res.status(409).json({ 
        success: false, 
        message: "Vehicle is not available for the requested rental dates." 
      });
    }

    const options = {
      amount: pricing.amountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${pricing.carData._id.toString().slice(-4)}`
    };

    logger.info("payment.order_creation_started", { 
      carId: targetCarId, 
      days: pricing.days, 
      price: pricing.finalPrice, 
      amountPaise: pricing.amountPaise 
    });
    
    // Create Razorpay order with server-calculated amount
    const order = await razorpayInstance.orders.create(options);
    
    logger.info("payment.order_created", { orderId: order.id, amount: order.amount });
    res.json({ 
      success: true, 
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      calculatedPrice: pricing.finalPrice,
      days: pricing.days,
      pricePerDay: pricing.pricePerDay
    });

  } catch (error) {
    const errorMsg = error?.error?.description || error.message || "Failed to create payment order";
    logger.error("payment.order_creation_failed", { error: errorMsg });
    
    res.status(400).json({ success: false, message: errorMsg });
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

/**
 * Initiates Razorpay payment order for an existing unpaid Pay Later booking
 */
export const createOrderForBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id } = req.user;

        const booking = await Booking.findById(id).populate('car');
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user.toString() !== _id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to pay for this booking" });
        }

        if (booking.status === "cancelled") {
            return res.status(409).json({ 
                success: false, 
                message: booking.cancellationReason || "Booking has already been cancelled." 
            });
        }

        if (booking.paymentStatus === "paid") {
            return res.status(400).json({ success: false, message: "Booking has already been paid" });
        }

        // Strict Server-Side Payment Deadline Check
        const deadline = booking.paymentDeadline || calculatePaymentDeadline(booking.pickupDate);
        if (isDeadlineExpired(booking.pickupDate, deadline)) {
            // Automatically cancel expired booking & release slot
            booking.status = "cancelled";
            booking.cancellationReason = "Payment deadline expired";
            booking.cancelledAt = new Date();
            booking.cancelledBy = "system";
            await booking.save();

            const carId = booking.car?._id || booking.car;
            if (carId) {
                await Car.findByIdAndUpdate(carId, {
                    $pull: { reservedSlots: { bookingId: booking._id } }
                });
            }

            logger.warn("booking.pay_order_rejected_deadline_expired", { bookingId: booking._id, deadline });
            return res.status(409).json({
                success: false,
                message: "Payment deadline has expired. This booking has been cancelled."
            });
        }

        const amountPaise = Math.round(booking.price * 100);
        const options = {
            amount: amountPaise,
            currency: "INR",
            receipt: `rcpt_pay_${booking._id.toString().slice(-6)}`
        };

        const order = await razorpayInstance.orders.create(options);
        logger.info("payment.booking_pay_order_created", { bookingId: booking._id, orderId: order.id, amount: order.amount });

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            booking
        });
    } catch (error) {
        logger.error("booking.pay_order_failed", { error: error.message });
        res.status(500).json({ success: false, message: error.message || "Failed to create payment order for booking" });
    }
};

/**
 * Verifies Razorpay payment for an existing Pay Later booking and confirms it
 */
export const verifyBookingPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id } = req.user;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing Razorpay verification details" });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            logger.error("payment.verify_booking_signature_mismatch", { razorpay_order_id, razorpay_payment_id });
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        const booking = await Booking.findById(id).populate('car').populate('user');
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user._id.toString() !== _id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Deadline & Cancellation Check prior to confirming payment (Race condition guard)
        const deadline = booking.paymentDeadline || calculatePaymentDeadline(booking.pickupDate);
        if (booking.status === "cancelled" || isDeadlineExpired(booking.pickupDate, deadline)) {
            if (booking.status !== "cancelled") {
                booking.status = "cancelled";
                booking.cancellationReason = "Payment deadline expired";
                booking.cancelledAt = new Date();
                booking.cancelledBy = "system";
                await booking.save();

                const carId = booking.car?._id || booking.car;
                if (carId) {
                    await Car.findByIdAndUpdate(carId, {
                        $pull: { reservedSlots: { bookingId: booking._id } }
                    });
                }
            }

            return res.status(409).json({
                success: false,
                message: "Payment deadline has expired. This booking has been cancelled."
            });
        }

        // Atomic status transition
        const updatedBooking = await Booking.findOneAndUpdate(
            {
                _id: id,
                user: _id,
                status: { $nin: ["cancelled", "completed", "expired"] },
                paymentStatus: { $ne: "paid" }
            },
            {
                $set: {
                    paymentId: razorpay_payment_id,
                    paymentStatus: "paid",
                    status: "confirmed"
                }
            },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(409).json({
                success: false,
                message: "Unable to confirm payment: booking has already been cancelled or processed."
            });
        }

        // Create Payment record
        await Payment.create({
            booking: id,
            user: _id,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: updatedBooking.price,
            currency: "INR",
            status: "PAID",
            method: "ONLINE",
            paidAt: new Date()
        });

        // Generate PDF receipt and send notification
        try {
            const populated = await Booking.findById(id).populate('user').populate('car');
            const pdfBuffer = await generateBookingReceipt(populated);
            populated.receiptGenerated = true;
            populated.receiptGeneratedAt = new Date();
            await populated.save();

            await createNotification({
                user: _id,
                type: "PAYMENT_SUCCESS",
                title: "Payment Received",
                message: `Payment of ₹${updatedBooking.price} for ${booking.car?.brand} ${booking.car?.model} is confirmed.`,
                booking: id,
                sendEmail: true,
                emailData: {
                    to: req.user.email,
                    subject: "Payment Confirmed 🚗",
                    html: `
                        <h2>Payment Confirmed</h2>
                        <p>Your payment for ${booking.car?.brand} ${booking.car?.model} has been successfully verified.</p>
                        <p><strong>Amount:</strong> ₹${updatedBooking.price}</p>
                        <p><strong>Pickup Date:</strong> ${new Date(booking.pickupDate).toLocaleDateString()}</p>
                        <p><strong>Return Date:</strong> ${new Date(booking.returnDate).toLocaleDateString()}</p>
                    `,
                    attachments: [{
                        filename: `CarRental_Booking_${id}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }]
                }
            });
        } catch (postErr) {
            logger.error("booking.verify_payment_post_ops_failed", { error: postErr.message });
        }

        res.json({ 
            success: true, 
            message: "Payment verified and booking confirmed", 
            booking: updatedBooking 
        });
    } catch (error) {
        logger.error("booking.verify_payment_failed", { error: error.message });
        res.status(500).json({ success: false, message: error.message || "Failed to verify payment" });
    }
};

/**
 * Explicit trigger for auto-cancellation cleanup job (for testing or external cron webhooks)
 */
export const triggerAutoCancellation = async (req, res) => {
    try {
        const result = await cancelExpiredUnpaidBookings();
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};