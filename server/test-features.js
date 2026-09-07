import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from './models/Car.js';
import Booking from './models/Booking.js';
import User from './models/user.js';
import Notification from './models/Notification.js';

dotenv.config();

async function runTests() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected.");

        console.log("Running Backend Logic Tests...");

        // Notification test
        const testUser = await User.create({
            name: "Test User",
            email: `test_${Date.now()}@test.com`,
            password: "password123",
            role: "user"
        });

        const notif = await Notification.create({
            user: testUser._id,
            type: "BOOKING_CREATED",
            title: "Test",
            message: "Test Message",
            status: "PENDING"
        });

        console.log("✅ Notification Model created successfully:", notif._id);

        const notifCount = await Notification.countDocuments({ user: testUser._id, status: "PENDING" });
        if (notifCount === 1) {
            console.log("✅ Notification query successful.");
        } else {
            console.log("❌ Notification query failed.");
        }

        // Cleanup
        await User.findByIdAndDelete(testUser._id);
        await Notification.findByIdAndDelete(notif._id);

        console.log("Tests Completed Successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}

runTests();
