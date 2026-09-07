import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Usermodel from './models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function runAuthTest() {
  try {
    console.log("1. Connecting to MongoDB:", process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB successfully.");

    const testEmail = "test2@gmail.com";
    const testPassword = "123456";
    const testName = "Test User 2";

    // Clean up existing test user if any
    await Usermodel.deleteOne({ email: testEmail });
    console.log("2. Cleaned up any existing test user.");

    // Test Registration Logic
    console.log("3. Testing Registration for:", testEmail);
    const hashpassword = await bcrypt.hash(testPassword, 10);
    const newUser = await Usermodel.create({
      name: testName,
      email: testEmail,
      password: hashpassword,
      role: "user"
    });
    console.log("✅ User registered successfully in DB:", { _id: newUser._id, email: newUser.email, role: newUser.role });

    // Test Token Generation
    const token = jwt.sign({ _id: newUser._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log("✅ JWT Token generated successfully:", token.slice(0, 25) + "...");

    // Test Login Logic
    console.log("4. Testing Login for:", testEmail);
    const foundUser = await Usermodel.findOne({ email: testEmail });
    if (!foundUser) {
      throw new Error("User not found during login test");
    }

    const isMatch = await bcrypt.compare(testPassword, foundUser.password);
    if (!isMatch) {
      throw new Error("Password mismatch during login test");
    }
    console.log("✅ Password comparison succeeded.");

    // Test Token Verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified successfully. Decoded payload:", decoded);

    const authedUser = await Usermodel.findById(decoded._id).select("-password");
    console.log("✅ User retrieved via token:", authedUser.name, authedUser.email);

    console.log("\n==========================================");
    console.log("🎉 ALL AUTHENTICATION TESTS PASSED 100%!");
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ AUTH TEST FAILED:", error);
    process.exit(1);
  }
}

runAuthTest();
