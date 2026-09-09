// ⚠️  CRITICAL: `import 'dotenv/config'` MUST be the very first import.
// ES module imports are hoisted and evaluated before any runtime code, so
// `dotenv.config()` called later (as a statement) runs AFTER all imported
// modules have already read process.env — meaning nodemailer.js would see
// undefined for EMAIL_USER / EMAIL_PASS.
// `import 'dotenv/config'` is itself an import and participates in the
// module graph, so Node resolves it first in the static order listed here.
import 'dotenv/config';

import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import logger from "./config/logger.js";
import userrouter from './routes/user.js';
import ownerrouter from "./routes/owner.js";
import bookingrouter from "./routes/booking.js";
import reviewrouter from "./routes/review.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import notificationrouter from "./routes/notification.js";
import { initCancellationScheduler } from "./services/cancellationService.js";
import { verifyTransporter } from "./config/nodemailer.js";

const app = express();
const PORT = process.env.PORT || 2005;

app.use(cors({
  origin: [
    "https://car-rental-mu-ashy.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
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

// Database connection helper with connection reuse for serverless & local
let dbPromise = null;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!dbPromise) {
    dbPromise = mongoose
      .connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 30000,
      })
      .then(() => {
        logger.info("Database.connected");
        return mongoose.connection;
      })
      .catch((error) => {
        dbPromise = null;
        logger.error("database.connection_failed", { error: error.message });
        throw error;
      });
  }
  return dbPromise;
};

// Middleware to ensure DB connection on every request (critical for serverless lambdas)
app.use(async (req, res, next) => {
  // Allow healthcheck root route without blocking if DB is cold
  if (req.path === '/' && req.method === 'GET') {
    connectDB().catch(() => {});
    return res.send("Server is Running");
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

app.use('/user', apiLimiter, userrouter);
app.use('/owner', apiLimiter, ownerrouter);
app.use('/bookings', apiLimiter, bookingrouter);
app.use('/review', apiLimiter, reviewrouter);
app.use('/notifications', apiLimiter, notificationrouter);

app.get('/', (req, res) => res.send("Server is Running"));

// In traditional / local environments (not Vercel serverless), start HTTP listener
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      initCancellationScheduler(5 * 60 * 1000);
      app.listen(PORT, async () => {
        logger.info("server.started", { port: PORT });
        // Verify SMTP after server is up — failure is logged but does NOT crash the app
        await verifyTransporter();
      });
    })
    .catch((error) => {
      logger.error("startup.failed", { error: error.message });
      process.exit(1);
    });
}

export default app;
