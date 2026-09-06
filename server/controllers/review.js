import Review from "../models/Review.js"
import Car from "../models/Car.js"; 
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import logger from "../config/logger.js"

export const addReview=async(req,res)=>{
    try{
       const {rating,comment}= req.body;
       const user = req.user;
      if(!user){
        return res.json({message:"User not Find",success:false})
      }  
      if(!rating){
        return res.json({message:"Rating are required",success:false})
      }
       
      const alreadyReviewed =await Review.findOne({
        user:user._id
      });
      if(alreadyReviewed){
        return res.json({message:"User already reviewed",success:false})
      }
      const review =await Review.create({
        user:user._id,
       
        rating,comment,
      });
      res.json({success:true,review})
    }
    catch(error){
         return res.json({message:error.message,success:false})
    }
}

export const deleteReview =async (req,res)=>{
    try{
       const {_id}=req.user;
       const {reviewId}=req.body;

       const reviewed=await Review.findById(reviewId);
       if(!reviewed) {
        return res.json({success:false,message:"Review not found"})
       }

       if(reviewed.user.toString()!==_id.toString()){
      return res.json({success:false, message:"Unauthorized or Other User"});
 }

          await Review.deleteOne({_id: reviewId});
          logger.info("review.deleted", { reviewId });
          res.json({success:true,message:"Review deleted successfully"})
}
 catch(error){
        logger.error("review.deletion_failed", { error: error.message, reviewId: req.body?.reviewId });
        return res.json({message:error.message, success:false})
    }
}

export const getReview =async(req,res)=>{

    try{
       const {_id}=req.user;
       const reviews=await Review.find().populate("user","name _id").sort({createdAt:-1})
     return  res.json({success:true,reviews})
    }
     catch(error){
        logger.error("review.fetch_failed", { error: error.message });
        return res.json({message:error.message, success:false})
    }
}
