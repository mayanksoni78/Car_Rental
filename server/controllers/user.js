import Usermodel from '../models/user.js'; 
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import Car from '../models/Car.js';
import { OAuth2Client } from "google-auth-library";


const generateToken = (userId)=>{
    const payload=userId;
   return  jwt.sign(payload,process.env.JWT_SECRET)
}

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export const registeruser= async (req, res)=>{

    try{
        const { name,email,password,role,phone_no}=req.body;

        if(!name || !email || ! password ){
            return res.json({message:"Fill all the fields", success: false})
        }
        if(role==="owner" && !phone_no){
            return res.json({message:"Phone number required", success: false})
        }
        const userexist =await Usermodel.findOne({email});
        if(userexist){
            return res.json({message:"User already exist", success: false})
        }
          const hashpassword= await bcrypt.hash(password,10);
          const user= await Usermodel.create({name,email,password: hashpassword,role:role||"user",phone_no:role=="owner"?phone_no:undefined})
           const token=generateToken(user._id.toString())
           res.json({success: true,token})
        }
    catch(error){
     return res.json({message:"Server Error !", success:false})
    }
};

//login user
export const loginuser =async (req,res)=>{
    try{
          const{email,password}=req.body;
          const user =await Usermodel.findOne({email});
          if(!user){
             return res.json({message:"User Not Found", success:false})
          }
          const ispass=await bcrypt.compare(password,user.password);
          
          if(!ispass){
            return res.json({message:"Invalid Password", success:false})
          }

          const token=generateToken(user._id.toString())
          res.json({success:true,token})
    }
    catch(error){
       return res.json({message:"Server Error !", success:false})
    }
}
//google login 
export const googleLogin =async(req,res)=>{
    try{
        const {token} =req.body;
      if(!token) return res.json({message:"No Google token Found",success:false})

      const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if(!payload) return res.json({message:"No Payload Found",success:false})

    const {
      name,
      email,
      picture,
      email_verified,
    } = payload;

    if (!email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google email not verified",
      });
    }
    let user = await Usermodel.findOne({ email });

    if (!user) {
      const randomPassword = Math.random()
        .toString(36)
        .slice(-10);

      const hashedPassword = await bcrypt.hash(
        randomPassword,
        10
      );

      user = await Usermodel.create({
        name,
        email,
        password: hashedPassword,
        role,
        image: picture || "",
      });
    }
    const appToken = generateToken(
      user._id.toString()
    );

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    };

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token: appToken,
      user: userData,
    });
   
    }
    catch(err){
        return res.json({message:err.message,success:false})
    }
}
// get user data
export const getUserData =async (req,res)=>{
    try{
            const {user}=req;
            res.json({success:true,user})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}
// get car data
export const getCars =async(req,res)=>{
    try{
     const cars= await Car.find({isAvailable:true})
     res.json({success:true, cars}) 
    }
    catch(error){
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

