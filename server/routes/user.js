import{ signupValidation,LoginValidation, protect } from '../middlewares/auth.js';
import { registeruser, loginuser, getUserData, getCars, googleLogin, forgotPassword, resetPassword} from '../controllers/user.js';
import express from 'express';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router=express.Router();

router.post ('/login', authLimiter, LoginValidation,loginuser);
router.post('/register', authLimiter, signupValidation,registeruser);
router.get('/data',protect,getUserData);
router.get('/cars',getCars);
router.post("/google-login", authLimiter, googleLogin);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

export default router;