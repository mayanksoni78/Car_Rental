import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: message || "Too many requests. Please try again later."
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

export const apiLimiter = createLimiter(
    process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, 
    process.env.RATE_LIMIT_MAX || 100
);

export const authLimiter = createLimiter(
    process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, 
    process.env.AUTH_RATE_LIMIT_MAX || 10,
    "Too many login attempts. Please try again later."
);

export const bookingLimiter = createLimiter(
    process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, 
    process.env.BOOKING_RATE_LIMIT_MAX || 20,
    "Too many booking requests. Please try again later."
);

export const paymentLimiter = createLimiter(
    process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, 
    process.env.PAYMENT_RATE_LIMIT_MAX || 10,
    "Too many payment requests. Please try again later."
);
