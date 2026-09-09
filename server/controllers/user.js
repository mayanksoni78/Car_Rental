import Usermodel from '../models/user.js'; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Car from '../models/Car.js';
import { OAuth2Client } from "google-auth-library";
import logger from "../config/logger.js"
import crypto from "crypto";
import transporter from "../config/nodemailer.js";


const generateToken = (userId)=>{
    const payload={ _id: userId };
   return  jwt.sign(payload,process.env.JWT_SECRET, { expiresIn: '7d' })
}

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export const registeruser = async (req, res) => {
    try {
        const { name, email, password, role, phone_no } = req.body;

        if (!name || !email || !password) {
            return res.json({ message: "Please fill all required fields", success: false });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (role === "owner" && !phone_no) {
            return res.json({ message: "Phone number is required for car owners", success: false });
        }

        const userexist = await Usermodel.findOne({ email: normalizedEmail });
        if (userexist) {
            return res.json({ message: "An account already exists with this email", success: false });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        const user = await Usermodel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashpassword,
            role: role || "user",
            phone_no: role === "owner" ? phone_no : undefined
        });

        const token = generateToken(user._id.toString());
        logger.info("user.registered", { userId: user._id, role: user.role });

        return res.json({
            success: true,
            message: "Account registered successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error("user.registration_failed", { error: error.message });
        return res.json({ message: error.message || "Registration failed", success: false });
    }
};

// login user
export const loginuser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ message: "Please enter both email and password", success: false });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await Usermodel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.json({ message: "Invalid email or password", success: false });
        }

        if (!user.password) {
            return res.json({ message: "This account uses Google Sign-In. Please click 'Continue with Google'.", success: false });
        }

        const ispass = await bcrypt.compare(password, user.password);
        if (!ispass) {
            logger.warn("user.login_failed", { reason: "invalid_password", email: normalizedEmail });
            return res.json({ message: "Invalid email or password", success: false });
        }

        const token = generateToken(user._id.toString());
        logger.info("user.login", { userId: user._id, method: "password" });

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error("user.login_error", { error: error.message });
        return res.json({ message: "Internal server error during login", success: false });
    }
};

// google login 
export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.json({ message: "No Google token provided", success: false });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.json({ message: "Invalid Google token payload", success: false });
        }

        const { name, email, picture, email_verified, sub } = payload;

        if (!email_verified) {
            return res.json({ success: false, message: "Google email is not verified" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await Usermodel.findOne({ email: normalizedEmail });

        if (!user) {
            user = await Usermodel.create({
                name: name || "Google User",
                email: normalizedEmail,
                googleId: sub,
                role: "user",
                image: picture || "",
            });
            logger.info("user.registered", { userId: user._id, method: "google" });
        } else if (!user.googleId) {
            user.googleId = sub;
            if (!user.image && picture) user.image = picture;
            await user.save();
        }

        const appToken = generateToken(user._id.toString());
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
        };

        logger.info("user.login", { userId: user._id, method: "google" });
        return res.json({
            success: true,
            message: "Google login successful",
            token: appToken,
            user: userData,
        });
    } catch (err) {
        logger.error("user.google_login_failed", { error: err.message });
        return res.json({ message: err.message || "Google authentication failed", success: false });
    }
};
// get user data
export const getUserData =async (req,res)=>{
    try{
            const {user}=req;
            res.json({success:true,user})
    }
    catch(error){
        logger.error("user.fetch_data_failed", { error: error.message });
        res.json({success:false, message:error.message})
    }
}
// get car data
export const getCars = async (req, res) => {
    try {
        const cars = await Car.find({ isAvailable: true }).populate('owner', 'name email phone_no image createdAt');
        res.json({ success: true, cars });
    } catch (error) {
        logger.error("car.fetch_all_failed", { error: error.message });
        res.json({ success: false, message: error.message });
    }
};

// forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const normalizedEmail = email.toLowerCase().trim();
        const user = await Usermodel.findOne({ email: normalizedEmail });

        if (!user) {
            // Anti-enumeration: return success even if user not found
            return res.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
        }

        // Generate cryptographically secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token for database storage — raw token never stored
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        // Trim trailing slash to prevent double-slash in reset URL
        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        try {
            await transporter.sendMail({
                from: `"Car Rental" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Password Reset Request — Car Rental",
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background:#F5F0E7;font-family:Arial,sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E7;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="background:#FAF7F0;border-radius:16px;border:1px solid #E4D9C7;overflow:hidden;max-width:560px;width:100%;">
                          <!-- Header -->
                          <tr>
                            <td style="background:#3D4C27;padding:28px 40px;text-align:center;">
                              <h1 style="margin:0;color:#FAF7F0;font-size:22px;font-weight:900;letter-spacing:1px;">🚗 Car Rental</h1>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:36px 40px;">
                              <p style="margin:0 0 8px;font-size:13px;color:#64748B;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Account Security</p>
                              <h2 style="margin:0 0 16px;color:#05091B;font-size:24px;font-weight:900;">Password Reset Request</h2>
                              <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
                                Hello <strong>${user.name}</strong>,
                              </p>
                              <p style="margin:0 0 28px;color:#334155;font-size:15px;line-height:1.6;">
                                We received a request to reset the password for your Car Rental account. Click the button below to set a new password.
                              </p>
                              <!-- CTA Button -->
                              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                                <tr>
                                  <td style="background:#3D4C27;border-radius:10px;">
                                    <a href="${resetUrl}"
                                       style="display:inline-block;padding:14px 32px;color:#FAF7F0;font-size:14px;font-weight:900;text-decoration:none;letter-spacing:0.5px;">
                                      Reset Password →
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:0 0 8px;color:#64748B;font-size:13px;">
                                Or copy and paste this link into your browser:
                              </p>
                              <p style="margin:0 0 28px;word-break:break-all;">
                                <a href="${resetUrl}" style="color:#3D4C27;font-size:12px;">${resetUrl}</a>
                              </p>
                              <!-- Expiry warning -->
                              <table width="100%" cellpadding="0" cellspacing="0" style="background:#EBF0E4;border-radius:10px;margin-bottom:20px;">
                                <tr>
                                  <td style="padding:14px 18px;">
                                    <p style="margin:0;color:#3D4C27;font-size:13px;font-weight:700;">⏱ This link expires in 15 minutes.</p>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:0;color:#94A3B8;font-size:12px;line-height:1.6;">
                                If you did not request a password reset, you can safely ignore this email. Your account password will not change.
                              </p>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="padding:20px 40px;border-top:1px solid #E4D9C7;text-align:center;">
                              <p style="margin:0;color:#94A3B8;font-size:11px;">© 2025 Car Rental Platform. All rights reserved.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                `
            });
            logger.info("user.forgot_password_email_sent", { userId: user._id });
        } catch (emailError) {
            // Clear the token so a stale hash is not left in the DB
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            // Log safe diagnostics — never log credentials or the reset token
            logger.error("user.forgot_password_email_failed", {
                error: emailError.message,
                code: emailError.code || "n/a",
                command: emailError.command || "n/a",
            });
            return res.status(500).json({ success: false, message: "Unable to send reset link. Please try again later." });
        }

        res.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });

    } catch (error) {
        logger.error("user.forgot_password_error", { error: error.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// reset password
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await Usermodel.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        logger.info("user.password_reset_success", { userId: user._id });
        res.json({ success: true, message: "Password reset successfully. You can now log in." });

    } catch (error) {
        logger.error("user.reset_password_error", { error: error.message });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

