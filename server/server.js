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

import logger from "./config/logger.js";

app.use(cors({
  origin: [
    "https://car-rental-mu-ashy.vercel.app",
    "http://localhost:5173",
  ],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("http.request", {
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      durationMs: duration
    });
  });
  next();
});

app.use('/user', userrouter);
app.use('/owner',ownerrouter)
app.use('/bookings',bookingrouter)
app.use('/review',reviewrouter)

mongoose
  .connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000, 
  })
  .then(() => {
    logger.info("database.connected");
  })
  .catch((error) => {
    logger.error("database.connection_failed", {
      error: error.message
    });
  });

app.listen(PORT,()=>logger.info("server.started", { port: PORT }))
app.get('/',(req,res)=>res.send("Server is Running"))