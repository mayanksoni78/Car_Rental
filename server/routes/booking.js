import express from "express";
import { changeBookingStatus, checkAvailabilityOfCar, createBooking, deleteBooking, getOwnerBooking, getUserBooking,getCarBooking,createOrder } from "../controllers/booking.js";
import { protect } from "../middlewares/auth.js";

const bookingrouter = express.Router();

bookingrouter.post('/check-availability',checkAvailabilityOfCar)
bookingrouter.post('/create',protect,createBooking)
bookingrouter.get('/user',protect,getUserBooking)
bookingrouter.get('/car/:id',protect,getCarBooking)
bookingrouter.get('/owner',protect,getOwnerBooking)
bookingrouter.post('/change-status',protect,changeBookingStatus)
bookingrouter.post('/delete-booking',protect,deleteBooking)
bookingrouter.post("/payment",protect,createOrder)
export default bookingrouter;
