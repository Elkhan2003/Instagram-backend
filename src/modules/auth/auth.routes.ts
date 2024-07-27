import { Router } from 'express';
import authenticateToken from '../../middleware/authenticateToken';
import authControllers from './auth.controllers';
import validateDto from '../../middleware/validateDto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

const router = Router();

router.post('/sign-in', validateDto(SignInDto), authControllers.loginUser);
router.post('/sign-up', validateDto(SignUpDto), authControllers.registerUser);
router.post('/logout', authenticateToken, authControllers.logoutUser);
router.patch(
	'/refresh',
	validateDto(RefreshTokenDto),
	authControllers.refreshToken
);
router.post(
	'/forgot',
	validateDto(ForgotPasswordDto),
	authControllers.forgotPassword
);
router.patch(
	'/reset-password',
	validateDto(ResetPasswordDto),
	authControllers.resetPassword
);
router.get('/user', authenticateToken, authControllers.getUser);

export default router;
