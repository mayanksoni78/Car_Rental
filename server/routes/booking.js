import express from "express";
import { changeBookingStatus, checkAvailabilityOfCar, createBooking, deleteBooking, getOwnerBooking, getUserBooking,getCarBooking,createOrder, downloadReceipt } from "../controllers/booking.js";
import { protect } from "../middlewares/auth.js";

import { bookingLimiter, paymentLimiter } from "../middlewares/rateLimiter.js";

const bookingrouter = express.Router();

bookingrouter.post('/check-availability', bookingLimiter, checkAvailabilityOfCar)
bookingrouter.post('/create', protect, bookingLimiter, createBooking)
bookingrouter.get('/user', protect, getUserBooking)
bookingrouter.get('/car/:id', protect, getCarBooking)
bookingrouter.get('/owner', protect, getOwnerBooking)
bookingrouter.post('/change-status', protect, changeBookingStatus)
bookingrouter.post('/delete-booking', protect, deleteBooking)
bookingrouter.post("/payment", protect, paymentLimiter, createOrder)
bookingrouter.get('/:id/receipt', protect, bookingLimiter, downloadReceipt)

export default bookingrouter;
