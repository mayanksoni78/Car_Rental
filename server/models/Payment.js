import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const PaymentSchema = new mongoose.Schema({
    booking: { type: ObjectId, ref: 'Booking', required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    provider: { type: String, default: 'razorpay' },
    orderId: { type: String, required: true },
    paymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { 
        type: String, 
        enum: ["CREATED", "PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"],
        default: "CREATED"
    },
    method: { type: String },
    paidAt: { type: Date },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundedAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ user: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;
