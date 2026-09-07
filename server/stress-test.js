import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from './models/Car.js';
import Booking from './models/Booking.js';
import User from './models/user.js';
import { createBooking } from './controllers/booking.js';

dotenv.config();

async function runStressTest() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected.");

        const owner = await User.create({
            name: "Test Owner",
            email: `owner_${Date.now()}@test.com`,
            password: "password123",
            role: "owner"
        });

        const user = await User.create({
            name: "Test User",
            email: `user_${Date.now()}@test.com`,
            password: "password123",
            role: "user"
        });

        const car = await Car.create({
            owner: owner._id,
            brand: "Test",
            number: "TEST-1234",
            model: "Model S",
            image: "test.jpg",
            year: 2024,
            category: "Sedan",
            seating_capacity: 5,
            fuel_type: "Electric",
            transmission: "Automatic",
            pricePerDay: 5000,
            location: "Test City",
            description: "A test car",
            isAvailable: true,
            ownerName: owner.name,
            phone_no: 9876543210
        });

        console.log(`Created Test Car ID: ${car._id}`);

        const pickupDate = new Date();
        pickupDate.setDate(pickupDate.getDate() + 1); 
        
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 3); 

        console.log("Starting 50 concurrent booking requests...");

        const CONCURRENT_REQUESTS = 50;
        let successCount = 0;
        let failCount = 0;
        const failedMessages = {};

        const makeRequest = async (index) => {
            return new Promise(async (resolve) => {
                const req = {
                    user: { _id: user._id, email: user.email },
                    body: {
                        car: car._id,
                        pickupDate: pickupDate.toISOString(),
                        returnDate: returnDate.toISOString(),
                        paymentId: "PAY_LATER"
                    },
                    headers: {
                        'idempotency-key': `idem_${Date.now()}_${index}`
                    }
                };

                const res = {
                    status: function(code) {
                        this.statusCode = code;
                        return this;
                    },
                    json: function(data) {
                        if (data.success) {
                            successCount++;
                        } else {
                            failCount++;
                            failedMessages[data.message] = (failedMessages[data.message] || 0) + 1;
                        }
                        resolve();
                    }
                };

                try {
                    await createBooking(req, res);
                } catch (e) {
                    failCount++;
                    failedMessages[e.message] = (failedMessages[e.message] || 0) + 1;
                    resolve();
                }
            });
        };

        const promises = [];
        for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
            promises.push(makeRequest(i));
        }

        await Promise.all(promises);

        console.log("=========================================");
        console.log("Stress Test Results:");
        console.log(`Total Requests: ${CONCURRENT_REQUESTS}`);
        console.log(`Successful Bookings: ${successCount}`);
        console.log(`Failed Bookings: ${failCount}`);
        console.log("Failure Reasons:", failedMessages);
        console.log("=========================================");

        if (successCount === 1 && failCount === CONCURRENT_REQUESTS - 1) {
            console.log("✅ TEST PASSED: Exactly 1 booking succeeded. Race condition prevented.");
        } else {
            console.log("❌ TEST FAILED: Expected exactly 1 success.");
        }

        console.log("Cleaning up test data...");
        await Car.findByIdAndDelete(car._id);
        await User.findByIdAndDelete(owner._id);
        await User.findByIdAndDelete(user._id);
        await Booking.deleteMany({ car: car._id });

        console.log("Cleanup complete. Exiting.");
        process.exit(0);

    } catch (error) {
        console.error("Test Error:", error);
        process.exit(1);
    }
}

runStressTest();
