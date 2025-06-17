import express from 'express';
import authcontroller from './controllers/auth-controller.js';
const router= express.Router();        


router.post('/api/send-otp', authcontroller.sendOtp);
router.post('/api/verify-otp', authcontroller.verifyOtp);
export default router;