import Joi from "joi";
import jwt from "jsonwebtoken";
import Usermodel from "../models/user.js";

export const signupValidation = (req, res, next) => {
    const Schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
        role: Joi.string().valid("user", "owner").default("user"),
        phone_no: Joi.string().allow('', null).optional(),
    });
    const { error } = Schema.validate(req.body);
    if (error) {
        return res.json({ success: false, message: error.details[0].message });
    }
    next();
};

export const LoginValidation = (req, res, next) => {
    const Schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(1).max(100).required(),
    });
    const { error } = Schema.validate(req.body);
    if (error) {
        return res.json({ success: false, message: error.details[0].message });
    }
    next();
};

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized, please login" });
    }
    try {
        token = token.replace(/^Bearer\s+/i, '').trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = typeof decoded === 'string' ? decoded : decoded._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid authentication token" });
        }
        req.user = await Usermodel.findById(userId).select("-password");
        if (!req.user) {
            return res.status(401).json({ success: false, message: "User account not found" });
        }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Session expired or invalid token" });
    }
};
