import imagekit from "../config/imagekit.js";
import Booking from "../models/Booking.js";
import Usermodel from "../models/user.js";
import Car from "../models/Car.js"
import fs from "fs"

export const changeRoleToOwner =async (req, res)=>{
    try{
        const {_id}=req.user;
        await Usermodel.findByIdAndUpdate(_id,{role:"owner"})
        res.json({success:true,message:"Now you can list your cars"})
    }
    catch(error){
        console.log(error.message);
        return res.json({message:error.message, success:false})
    }
}

// API to List Car
export const addcar= async(req,res)=>{
    try{
        const {_id}=req.user;
        let car=JSON.parse(req.body.carData);
        const imageFile=req.file;
        //upload image to imagekit
        const fileBuffer =fs.readFileSync(imageFile.path)
       const response=await imagekit.upload({
            file:fileBuffer,
            fileName: imageFile.originalname,
            folder:"/cars"
        })
        //optimization through imagekit url
        var optimizedImageUrl=imagekit.url({
            path:response.filePath,
            transformation:[
                {width: '1280'},
                {quality:'auto'},
                {format:'webp'},
            ]
        });

        const image =optimizedImageUrl;
        const userdata=await Usermodel.findById(_id);
        if (!userdata || !userdata.phone_no) {
      return res.status(400).json({
        success: false,
        message: "Please add phone number before listing a car",
      });
    }
        await Car.create({...car,owner:_id,ownerName:userdata.name, phone_no:userdata.phone_no ,image})
        res.json({message:"Car Added",success:true})
    }
    catch(error){
        console.log(error.message);
        return res.json({message:error.message, success:false})
    }
}

//api to get data
export const getOwnerCars =async(req,res)=>{
try{
 const {_id}=req.user;
 const cars= await Car.find({owner: _id})
 res.json({success:true,cars})
}
 catch(error){
        console.log(error.message);
        return res.status(404).json({message:error.message, success:false})
    }
}

//api toggle car availability
export const toggleCarAvailability =async(req,res)=>{
try{
 const {_id}=req.user;
 const {carId}=req.body;
 const car =await Car.findById(carId);

 if(car.owner.toString()!==_id.toString()){
    return res.json({success:false, message:"Unauthorized"});
 }
 car.isAvailable=!car.isAvailable;
 await car.save();
 res.json({success:true,message:"Availability Toggled"})
}
 catch(error){
        console.log(error.message);
        return res.json({message:error.message, success:false})
    }
}

//api to delete the car
export const deleteCar =async(req,res)=>{
try{
 const {_id}=req.user;
 const {carId}=req.body;
 const car =await Car.findById(carId);

 if(car.owner.toString()!==_id.toString()){
    return res.json({success:false, message:"Unauthorized"});
 }
 car.owner=null;
 Car.isAvailable=false;
 await car.save();
 res.json({success:true,message:"Car Removed"})
}
 catch(error){
        console.log(error.message);
        return res.json({message:error.message, success:false})
    }
}

//get dashboard data
export const getDashboardData=async(req,res)=>{
try{
 const {_id,role}=req.user;

 if(role!=='owner'){
    return res.json({success:false, message:"Unauthorized"});
 }
const cars= await Car.find({owner:_id})
const bookings =await Booking.find({owner:_id}).populate('car').sort({createdAt:-1})
 
const pendingBookings =await Booking.find({owner:_id, status:"pending"})
const confirmedBookings =await Booking.find({owner:_id, status:"confirmed"})

const monthlyRevenue= bookings.slice().filter(booking=>booking.status==='confirmed').reduce((acc,booking)=>acc+booking.price, 0)

const dashboardData ={
    totalCars: cars.length,
    totalBookings: bookings.length,
    pendingBookings: pendingBookings.length,
    completeBookings: confirmedBookings.length,
    recentBookings: bookings.slice(0,3), // show only 3 booking 
    monthlyRevenue: monthlyRevenue,
}
res.json({success:true, dashboardData});
}
 catch(error){
        console.log(error.message);
        return res.status(404).json({message:error.message, success:false})
    }
}

export const updateUserImage =async(req,res)=>{
try{
  const {_id}=req.user;

  const imageFile=req.file;

        //upload image to imagekit
    const fileBuffer =fs.readFileSync(imageFile.path)
       const response=await imagekit.upload({
            file:fileBuffer,
            fileName: imageFile.originalname,
            folder:"/user"
        })
        //optimization through imagekit url
        var optimizedImageUrl=imagekit.url({
            path:response.filePath,
            transformation:[
                {width: '400'},
                {quality:'auto'},
                {format:'webp'},
            ]
        });
        const image =optimizedImageUrl;
        await Usermodel.findByIdAndUpdate(_id,{image});
        res.json({message:"Image Updated",success:true})
}
 catch(error){
        console.log(error.message);
        return res.json({message:error.message, success:false})
    }
}
