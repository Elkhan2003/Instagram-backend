import { Router } from 'express';
import authControllers from './auth.controllers';

const router = Router();

router.post('/login', authControllers.loginUser);
router.post('/registration', authControllers.registrationUser);
router.get('/user', authControllers.authenticateToken, authControllers.getUser);

export default router;
