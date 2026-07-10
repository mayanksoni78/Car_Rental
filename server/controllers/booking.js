import Booking from "../models/Booking.js"
import Car from "../models/Car.js";
import transporter from "../config/nodemailer.js";
import razorpayInstance from "../config/razorpay.js";
import nodemailer from "nodemailer"

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

export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate, paymentId } = req.body;

        const isAvailable = await checkAvailability(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ message: "Car is not Available", success: false })
        }
        const carData = await Car.findById(car);
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        if (returned <= picked) {
            return res.json({
                success: false,
                message: "Return date must be after pickup date"
            });
        }

        const noOfDays = Math.ceil(
            (returned - picked) / (1000 * 60 * 60 * 24)
        );
        const price = carData.pricePerDay * noOfDays

        await Booking.create({
            car,
            owner: carData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price,
            paymentId,
            paymentStatus: paymentId === "PAY_LATER" ? "pending" : "paid"
        })

        await sendemail(
            req.user.email,
            "Booking Request Submitted 🚗",
            `
                <h1>Booking Request Submitted</h1>
                <p>Your booking request has been submitted successfully.</p>
                <p>Car: ${carData.brand} ${carData.model}</p>
                <p>Pickup Date: ${new Date(pickupDate).toLocaleDateString()}</p>
                <p>Return Date: ${new Date(returnDate).toLocaleDateString()}</p>
                <p>Total Price: ₹${price}</p>
            `
        );
        res.json({ success: true, message: "Booking Created" })
    }

    catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
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
        console.log("Email Sent")
    }
    catch (error) {
        console.log(error.message);
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
  console.log("------ 🚀 CREATE ORDER API HIT 🚀 ------");
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

    console.log("Calling Razorpay API to create order...");
    
    // We use your already-configured instance from your config file here!
    const order = await razorpayInstance.orders.create(options);
    
    console.log("✅ Order created successfully:", order.id);
    res.json({ success: true, order });

  } catch (error) {
    console.log("----- 🚨 RAZORPAY CRASHED 🚨 -----");
    console.log("Raw Error Object:", error);
    
    // Guaranteed to catch Razorpay's hidden error messages
    const errorMsg = error?.error?.description || error.message || "Razorpay API Failed";
    console.log("Sending Error to Frontend:", errorMsg);
    
    res.json({ success: false, message: errorMsg });
  }
};