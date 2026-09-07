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

app.set('trust proxy', 1);

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

import { apiLimiter } from "./middlewares/rateLimiter.js";
import notificationrouter from "./routes/notification.js";

app.use('/user', apiLimiter, userrouter);
app.use('/owner', apiLimiter, ownerrouter)
app.use('/bookings', apiLimiter, bookingrouter)
app.use('/review', apiLimiter, reviewrouter)
app.use('/notifications', apiLimiter, notificationrouter)

mongoose
  .connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000, 
  })
  .then(() => {
    logger.info("database.connected");
    app.listen(PORT, () => logger.info("server.started", { port: PORT }));
  })
  .catch((error) => {
    logger.error("database.connection_failed", {
      error: error.message
    });
    process.exit(1);
  });

app.get('/', (req, res) => res.send("Server is Running"));