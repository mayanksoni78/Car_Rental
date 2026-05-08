import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import userrouter from './routes/user.js';
import ownerrouter from "./routes/owner.js";
import bookingrouter from "./routes/booking.js";
import reviewrouter from "./routes/review.js";

const app=express();
dotenv.config();

const PORT=process.env.PORT||2005;  


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://car-rental-8ktp.onrender.com"
  ],
  credentials: true
}));


app.use(express.json());
app.use('/user', userrouter);
app.use('/owner',ownerrouter)
app.use('/bookings',bookingrouter)
app.use('/review',reviewrouter)

mongoose
  .connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000, 
  })
  .then(() => {
    console.log(" MONGO CONNECTED");
  })
  .catch((error) => {
    console.error("MONGO CONNECTION FAILED");
    console.error("REASON:", error.message);
  });

app.listen(PORT,()=>console.log(`Server Running on PORT ${PORT}`))
app.get('/',(req,res)=>res.send("Server is Running"))
