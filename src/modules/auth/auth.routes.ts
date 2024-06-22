import { Router } from 'express';
import authControllers from './auth.controllers';

const router = Router();

router.post('/sign-in', authControllers.loginUser);
router.post('/sign-up', authControllers.registerUser);
router.post('/logout', authControllers.logoutUser);
router.post('/refresh', authControllers.refreshToken);
router.post('/forgot', authControllers.forgotPassword);
router.get('/user', authControllers.authenticateToken, authControllers.getUser);
router.get('/get', authControllers.getRedisData);
router.post('/set', authControllers.postRedisData);
router.post('/set', authControllers.postRedisData);
// router.post('/send-sms', authControllers.sendSms);

export default router;
