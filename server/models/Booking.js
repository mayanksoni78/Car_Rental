import mongoose from "mongoose"
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
 car: {type:ObjectId, ref: "Car", required:true}, 
 user: {type:ObjectId, ref: "User", required:true}, 
 owner: {type:ObjectId, ref: "User", required:true}, 
 pickupDate:{type:Date, required:true},
 returnDate:{type:Date, required:true},
 status:{type:String, enum:["pending","pending_payment","confirmed", "active", "completed", "cancelled", "expired"], default:"pending"},
 price:{type:Number, required:true},
 paymentId:{type:String},
 paymentStatus:{type:String, enum:["pending","processing","paid","failed"], default:"pending"},
 paymentDeadline: { type: Date },
 cancellationReason: { type: String },
 cancelledAt: { type: Date },
 cancelledBy: { type: String, enum: ["user", "owner", "admin", "system"] },
 receiptGenerated: { type: Boolean, default: false },
 receiptGeneratedAt: { type: Date },
 idempotencyKey: { type: String, unique: true, sparse: true }
},{timestamps:true});

bookingSchema.index({ car: 1, pickupDate: 1, returnDate: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({ status: 1, paymentStatus: 1, paymentDeadline: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;