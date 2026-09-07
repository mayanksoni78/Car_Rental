import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import Notification from "../models/Notification.js";
import { createNotification } from "./notificationService.js";
import { isDeadlineExpired, calculatePaymentDeadline } from "../utils/deadline.js";
import logger from "../config/logger.js";

/**
 * Server-side Automatic Cancellation Job
 * Finds all unpaid Pay Later bookings where payment deadline has passed or pickup date has begun,
 * atomically cancels them, releases reserved slots on Car inventory, and logs audit events.
 * 
 * @param {Date} [overrideNow] Optional current time for deterministic testing
 * @returns {Promise<{ cancelledCount: number, cancelledBookings: Array }>}
 */
export const cancelExpiredUnpaidBookings = async (overrideNow = new Date()) => {
    const now = overrideNow;
    let cancelledCount = 0;
    const cancelledBookings = [];

    try {
        // Query eligible candidate bookings:
        // - status is not already cancelled, completed, or active
        // - paymentStatus is pending or failed (NOT paid)
        // - either paymentDeadline is in the past OR pickupDate is in the past/today
        const candidateBookings = await Booking.find({
            status: { $in: ["pending", "pending_payment", "confirmed"] },
            paymentStatus: { $ne: "paid" },
            $or: [
                { paymentDeadline: { $lte: now } },
                { pickupDate: { $lte: now } }
            ]
        }).populate('user').populate('car');

        for (const booking of candidateBookings) {
            // Strict deadline verification using application business timezone
            const deadline = booking.paymentDeadline || calculatePaymentDeadline(booking.pickupDate);
            if (!isDeadlineExpired(booking.pickupDate, deadline, now)) {
                continue;
            }

            // Atomic state transition: ensures no concurrent payment race condition
            const cancelled = await Booking.findOneAndUpdate(
                {
                    _id: booking._id,
                    status: { $in: ["pending", "pending_payment", "confirmed"] },
                    paymentStatus: { $ne: "paid" }
                },
                {
                    $set: {
                        status: "cancelled",
                        cancellationReason: "Payment deadline expired",
                        cancelledAt: now,
                        cancelledBy: "system"
                    }
                },
                { new: true }
            );

            if (cancelled) {
                cancelledCount++;
                cancelledBookings.push(cancelled._id);

                // 1. Atomically release car inventory slot
                const carId = booking.car?._id || booking.car;
                if (carId) {
                    await Car.findByIdAndUpdate(carId, {
                        $pull: { reservedSlots: { bookingId: cancelled._id } }
                    });
                    logger.info("cancellation.slot_released", { bookingId: cancelled._id, carId });
                }

                // 2. Idempotent In-App Notification & Email (avoid duplicate notifications if rerun)
                try {
                    const existingNotif = await Notification.findOne({
                        booking: cancelled._id,
                        type: "BOOKING_CANCELLED"
                    });

                    if (!existingNotif && booking.user?._id) {
                        const userEmail = booking.user?.email;
                        const carBrand = booking.car?.brand || "vehicle";
                        const carModel = booking.car?.model || "";

                        await createNotification({
                            user: booking.user._id,
                            type: "BOOKING_CANCELLED",
                            title: "Booking Cancelled (Payment Deadline Expired)",
                            message: `Your booking for ${carBrand} ${carModel} was cancelled because payment was not completed before the payment deadline.`,
                            booking: cancelled._id,
                            sendEmail: Boolean(userEmail),
                            emailData: userEmail ? {
                                to: userEmail,
                                subject: "Booking Cancelled - Payment Deadline Expired 🚗",
                                html: `
                                    <h2>Booking Cancelled</h2>
                                    <p>Dear ${booking.user.name || 'Customer'},</p>
                                    <p>Your reservation for <strong>${carBrand} ${carModel}</strong> has been automatically cancelled because payment was not completed before the payment deadline.</p>
                                    <p>The vehicle has been returned to available fleet inventory.</p>
                                    <p>Feel free to make a new reservation at your convenience.</p>
                                `
                            } : undefined
                        });
                    }
                } catch (notifErr) {
                    logger.error("cancellation.notification_failed", { bookingId: cancelled._id, error: notifErr.message });
                }

                logger.info("cancellation.auto_cancelled_unpaid_booking", {
                    bookingId: cancelled._id,
                    pickupDate: booking.pickupDate,
                    deadline: deadline
                });
            }
        }

        if (cancelledCount > 0) {
            logger.info("cancellation.job_completed", { cancelledCount, cancelledBookings });
        }
    } catch (error) {
        logger.error("cancellation.job_failed", { error: error.message });
    }

    return { cancelledCount, cancelledBookings };
};

/**
 * Background Cancellation Scheduler
 * Runs periodically (default: every 5 minutes) to clean up expired unpaid bookings
 */
let schedulerInterval = null;

export const initCancellationScheduler = (intervalMs = 5 * 60 * 1000) => {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
    }

    // Run once on startup
    cancelExpiredUnpaidBookings().catch(err => {
        logger.error("cancellation.startup_run_failed", { error: err.message });
    });

    // Run periodically
    schedulerInterval = setInterval(() => {
        cancelExpiredUnpaidBookings().catch(err => {
            logger.error("cancellation.periodic_run_failed", { error: err.message });
        });
    }, intervalMs);

    if (schedulerInterval.unref) {
        schedulerInterval.unref(); // Prevent timer from keeping test suites open
    }

    logger.info("cancellation.scheduler_started", { intervalMs });
};

export const stopCancellationScheduler = () => {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        logger.info("cancellation.scheduler_stopped");
    }
};
