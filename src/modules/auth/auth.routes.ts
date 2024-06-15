import { Router } from 'express';
import authControllers from './auth.controllers';

const router = Router();

router.post('/sign-in', authControllers.loginUser);
router.post('/sign-up', authControllers.registrationUser);
router.get('/user', authControllers.authenticateToken, authControllers.getUser);

export default router;
