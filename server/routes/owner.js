import express from 'express';
import { protect } from '../middlewares/auth.js';
import { addcar, changeRoleToOwner, deleteCar, getDashboardData, getOwnerCars, toggleCarAvailability, updateUserImage, updateOwnerProfile } from '../controllers/owner.js';
import upload from '../middlewares/multer.js';

const ownerrouter = express.Router();

ownerrouter.post("/change-role", protect, changeRoleToOwner);
ownerrouter.post("/add-car", upload.single("image"), protect, addcar);
ownerrouter.get("/cars", protect, getOwnerCars);
ownerrouter.post("/toggle-car", protect, toggleCarAvailability);
ownerrouter.post("/delete-car", protect, deleteCar);
ownerrouter.get("/dashboard", protect, getDashboardData);
ownerrouter.post("/update-image", upload.single("image"), protect, updateUserImage);
ownerrouter.post("/update-profile", protect, updateOwnerProfile);

export default ownerrouter;