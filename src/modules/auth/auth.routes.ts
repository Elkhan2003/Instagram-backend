import { Router } from 'express';
import authenticateToken from '../../middleware/authenticateToken';
import authControllers from './auth.controllers';

const router = Router();

router.post('/sign-in', authControllers.loginUser);
router.post('/sign-up', authControllers.registerUser);
router.post('/logout', authenticateToken, authControllers.logoutUser);
router.patch('/refresh', authControllers.refreshToken);
router.post('/forgot', authControllers.forgotPassword);
router.patch('/reset-password', authControllers.resetPassword);
router.get('/user', authenticateToken, authControllers.getUser);

export default router;
