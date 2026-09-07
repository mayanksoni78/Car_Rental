import Joi from "joi";
import jwt from "jsonwebtoken";
import Usermodel from "../models/user.js";

export const signupValidation=(req,res,next)=>{
    const Schema=Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(3).max(10).required(),
        role: Joi.string().valid("user", "owner").default("user"),
        phone_no: Joi.when("role", {is: "owner",then: Joi.string().length(10).pattern(/^[0-9]+$/).required()
        .messages({
          "any.required": "Phone number is required for owner",
        }),
        otherwise: Joi.forbidden(),}),
    });
    const {error}=Schema.validate(req.body);
    if(error){
        return res.json({message:"BAD REQUEST",error: error.details[0].message})
    }
    next();
}
//login
export const LoginValidation=(req,res,next)=>{
    const Schema=Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(3).max(10).required(),
    });
    const {error}=Schema.validate(req.body);
    if(error){
        return res.json({message:"BAD REQUEST",error:error.details[0].message})
    }
    next();
}

//protect
export const protect =async (req,res,next)=>{
    const token =req.headers.authorization;
    if(!token){
        return res.json({success:false, message:"Not Authorized"})
    }
    try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         const userId = typeof decoded === 'string' ? decoded : decoded._id;
         if (!userId) {
            return res.status(401).json({message: "Not Authorized, token failed", success: false})
         }
         req.user = await Usermodel.findById(userId).select("-password");
         if (!req.user) {
             return res.status(401).json({message: "User not found", success: false})
         }
         next();
    }
    catch(error){
        return res.json({message:"Not Authorized",success:false})
    }
}
