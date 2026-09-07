import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import userrouter from './routes/user.js';
import Usermodel from './models/user.js';

const app = express();
app.use(express.json());
app.use('/user', userrouter);

async function testHttpAuth() {
  await mongoose.connect(process.env.MONGO_URL);
  const server = app.listen(2099);

  try {
    const testEmail = "test2@gmail.com";
    const testPassword = "123456";

    // Clean up
    await Usermodel.deleteOne({ email: testEmail });

    // 1. Test POST /user/register
    console.log("1. Testing HTTP POST /user/register...");
    const regRes = await fetch("http://localhost:2099/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User 2",
        email: testEmail,
        password: testPassword,
        role: "user"
      })
    });
    const regData = await regRes.json();
    console.log("Registration response:", regData);
    if (!regData.success) {
      throw new Error("HTTP Registration failed: " + regData.message);
    }
    console.log("✅ HTTP Registration Succeeded!");

    // 2. Test POST /user/login
    console.log("2. Testing HTTP POST /user/login...");
    const loginRes = await fetch("http://localhost:2099/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    console.log("Login response:", loginData);
    if (!loginData.success) {
      throw new Error("HTTP Login failed: " + loginData.message);
    }
    console.log("✅ HTTP Login Succeeded!");

    // 3. Test GET /user/data
    console.log("3. Testing HTTP GET /user/data with token...");
    const dataRes = await fetch("http://localhost:2099/user/data", {
      headers: { "Authorization": `Bearer ${loginData.token}` }
    });
    const userData = await dataRes.json();
    console.log("User data response:", userData);
    if (!userData.success) {
      throw new Error("HTTP Get User Data failed: " + userData.message);
    }
    console.log("✅ HTTP Protected Route Succeeded!");

    console.log("\n==========================================");
    console.log("🎉 ALL HTTP ENDPOINT TESTS PASSED 100%!");
    console.log("==========================================");

    server.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ HTTP TEST FAILED:", err);
    server.close();
    process.exit(1);
  }
}

testHttpAuth();
