import imagekit from "../config/imagekit.js";
import Booking from "../models/Booking.js";
import Usermodel from "../models/user.js";
import Car from "../models/Car.js"
import fs from "fs"
import logger from "../config/logger.js"

export const changeRoleToOwner =async (req, res)=>{
    try{
        const {_id}=req.user;
        await Usermodel.findByIdAndUpdate(_id,{role:"owner"})
        logger.info("user.role_changed", { userId: _id, role: "owner" });
        res.json({success:true,message:"Now you can list your cars"})
    }
    catch(error){
        logger.error("user.role_change_failed", { error: error.message });
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
        const createdCar = await Car.create({...car,owner:_id,ownerName:userdata.name, phone_no:userdata.phone_no ,image})
        logger.info("car.added", { carId: createdCar._id, ownerId: _id });
        res.json({message:"Car Added",success:true})
    }
    catch(error){
        logger.error("car.add_failed", { error: error.message });
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
        logger.error("owner.fetch_cars_failed", { error: error.message });
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
 logger.info("car.availability_toggled", { carId, isAvailable: car.isAvailable });
 res.json({success:true,message:"Availability Toggled"})
}
 catch(error){
        logger.error("car.toggle_availability_failed", { error: error.message });
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
 car.isAvailable=false;
 await car.save();
 logger.info("car.deleted", { carId });
 res.json({success:true,message:"Car Removed"})
}
 catch(error){
        logger.error("car.deletion_failed", { error: error.message });
        return res.json({message:error.message, success:false})
    }
}

//get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;

        if (role !== 'owner' && role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized: Owner access required" });
        }

        const cars = await Car.find({ owner: _id });
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

        const pendingBookings = bookings.filter(b => b.status === "pending" || b.status === "pending_payment");
        const confirmedBookings = bookings.filter(b => b.status === "confirmed" || b.status === "active" || b.status === "completed");

        // Calculate current month date bounds
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const currentMonthBookings = bookings.filter(b => {
            const bDate = new Date(b.createdAt);
            const isConfirmedOrPaid = (b.status === 'confirmed' || b.status === 'completed' || b.status === 'active' || b.paymentStatus === 'paid');
            return isConfirmedOrPaid && b.status !== 'cancelled' && bDate >= startOfMonth;
        });

        const monthlyRevenue = currentMonthBookings.reduce((acc, b) => acc + (Number(b.price) || 0), 0);
        
        const totalRevenue = bookings
            .filter(b => (b.status === 'confirmed' || b.status === 'completed' || b.status === 'active' || b.paymentStatus === 'paid') && b.status !== 'cancelled')
            .reduce((acc, b) => acc + (Number(b.price) || 0), 0);

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completeBookings: confirmedBookings.length,
            recentBookings: bookings.slice(0, 5),
            monthlyRevenue: monthlyRevenue,
            totalRevenue: totalRevenue
        };

        res.json({ success: true, dashboardData });
    }
    catch (error) {
        logger.error("owner.dashboard_fetch_failed", { error: error.message });
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        const imageFile = req.file;
        if (!imageFile) {
            return res.json({ success: false, message: "No image file uploaded" });
        }

        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/user"
        });

        var optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '400' },
                { quality: 'auto' },
                { format: 'webp' },
            ]
        });

        const image = optimizedImageUrl;
        await Usermodel.findByIdAndUpdate(_id, { image });
        logger.info("user.image_updated", { userId: _id });
        res.json({ message: "Profile photo updated successfully", success: true, image });
    } catch (error) {
        logger.error("user.image_update_failed", { error: error.message });
        return res.json({ message: error.message, success: false });
    }
};

export const updateOwnerProfile = async (req, res) => {
    try {
        const { _id } = req.user;
        const { name, phone_no } = req.body;

        const updateData = {};
        if (name && name.trim()) updateData.name = name.trim();
        if (phone_no !== undefined) updateData.phone_no = phone_no.trim();

        const updatedUser = await Usermodel.findByIdAndUpdate(_id, updateData, { new: true });
        logger.info("owner.profile_updated", { userId: _id });

        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                image: updatedUser.image,
                phone_no: updatedUser.phone_no
            }
        });
    } catch (error) {
        logger.error("owner.profile_update_failed", { error: error.message });
        return res.json({ message: error.message, success: false });
    }
};

