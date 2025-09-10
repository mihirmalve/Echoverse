import express from 'express';
import authcontroller from './controllers/auth-controller.js';
import activatecontroller from './controllers/activate-controller.js';
import authMiddleware from './middlewares/auth-middleware.js';
import roomsController from './controllers/rooms-controller.js';
const router= express.Router();        


router.post('/api/send-otp', authcontroller.sendOtp);
router.post('/api/verify-otp', authcontroller.verifyOtp);
router.post('/api/activate',authMiddleware, activatecontroller.activate);
router.get('/api/refresh',authcontroller.refresh);
router.post('/api/logout',authMiddleware, authcontroller.logout);
router.post('/api/rooms', authMiddleware, roomsController.create);
router.get('/api/rooms', authMiddleware, roomsController.index);
router.get('/api/rooms/:roomId', authMiddleware, roomsController.show);
export default router;