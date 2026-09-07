import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const NotificationSchema = new mongoose.Schema({
    user: { type: ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: [
            "BOOKING_CREATED", "BOOKING_CONFIRMED", "BOOKING_CANCELLED", 
            "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PAYMENT_PENDING",
            "REFUND_INITIATED", "REFUND_COMPLETED", "PICKUP_REMINDER", "RETURN_REMINDER"
        ],
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    booking: { type: ObjectId, ref: 'Booking' },
    status: { type: String, enum: ["PENDING", "SENT", "FAILED", "READ"], default: "PENDING" },
    error: { type: String },
    sentAt: { type: Date }
}, { timestamps: true });

NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, status: 1 });
NotificationSchema.index({ booking: 1, type: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
