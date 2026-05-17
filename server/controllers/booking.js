import Booking from "../models/Booking.js"
import Car from "../models/Car.js";
import transporter from "../config/nodemailer.js";
import razorpay from "../config/razorpay.js";

const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
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

//Api to create Booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate } = req.body;

        const isAvailable = await checkAvailability(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ message: "Car is not Available", success: false })
        }
        const carData = await Car.findById(car);
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
        const price = carData.pricePerDay * noOfDays

        await Booking.create({ car, owner: carData.owner, user: _id, pickupDate, returnDate, price })

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
        res.json({ message: error.message, success: false })
    }
}

//Api to list user Booking 

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

//api to get owner booking 

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

// Api to change the booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status} = req.body;

        const booking = await Booking.findById(bookingId).populate('car').populate('user');

        if(!booking){
            return res.json({ success: false, message: "Booking not found" })
        }

        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" })
        }
        booking.status = status;
        await booking.save();
        if(status==="confirmed"){
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
        if(status==="cancelled"){
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

// sending emails
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

//Car Booking for owner
export const getCarBooking = async (req, res) => {
    try {
        const bookings = await Booking.find({ car: req.params.id }).populate('user', '-password').sort({ createdAt: -1 })
        res.json({ success: true, bookings })
    }
    catch (error) {
        res.json({ message: error.message, success: false })
    }
}


// rajorpay order creation
export const createOrder = async (req, res) => {
  try {

    const { amount } = req.body;

    if (!amount) {
      return res.json({
        success: false,
        message: "Amount is required"
      });
    }

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order
    });

  } catch (error) {

    console.log("RAZORPAY ERROR:", error.message);

    res.json({
      success: false,
      message: error.message
    });
  }
};
  