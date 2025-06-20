import express from 'express';
import authcontroller from './controllers/auth-controller.js';
import activatecontroller from './controllers/activate-controller.js';
import authMiddleware from './middlewares/auth-middleware.js';
const router= express.Router();        


router.post('/api/send-otp', authcontroller.sendOtp);
router.post('/api/verify-otp', authcontroller.verifyOtp);
router.post('/api/activate',authMiddleware, activatecontroller.activate);
export default router;