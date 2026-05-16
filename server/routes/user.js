import{ signupValidation,LoginValidation, protect } from '../middlewares/auth.js';
import { registeruser, loginuser, getUserData, getCars, googleLogin,createOrder} from '../controllers/user.js';
import express from 'express';
const router=express.Router();

router.post ('/login',LoginValidation,loginuser);
router.post('/register',signupValidation,registeruser);
router.get('/data',protect,getUserData);
router.get('/cars',getCars);
router.post("/google-login", googleLogin);
router.post("/create-order",protect,createOrder)
export default router;