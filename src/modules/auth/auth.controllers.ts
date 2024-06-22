import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../plugins/prisma';
import { redis } from '../../plugins/redis';
import { mailer } from '../../plugins/mailer';
import { ACCESS_TOKEN_EXPIRATION, COOKIE_SETTINGS } from '../../constants';

const getRedisData = async (req: Request, res: Response) => {
	const result = await redis.getData('elcho');
	res.status(200).send(JSON.stringify(result));
};

const postRedisData = async (req: Request, res: Response) => {
	const exampleData = {
		hint: {
			login: 'string',
			password: 'string',
			userName: 'string',
			photo: 'string'
		}
	};
	const result = await redis.setData('elcho', exampleData, 3);
	res.status(201).send(JSON.stringify(result));
};

const generateTokens = (payload: object) => {
	const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '1m'
	});
	const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: '15d'
	});
	return { accessToken, refreshToken };
};

const registerUser = async (req: Request, res: Response) => {
	const { login, password, userName, photo } = req.body;
	const { fingerprint } = req;

	if (!login || !password || !userName || !photo) {
		return res.status(400).send({
			message: 'Все поля обязательны для заполнения',
			hint: {
				login: 'string',
				password: 'string',
				userName: 'string',
				photo: 'string'
			}
		});
	}

	if (
		login.length < 2 ||
		password.length < 2 ||
		userName.length < 2 ||
		photo.length < 2
	) {
		return res.status(400).send({
			message: 'Все поля должны содержать минимум 2 символа',
			hint: {
				login: 'минимум 2 символа',
				password: 'минимум 2 символа',
				userName: 'минимум 2 символа',
				photo: 'минимум 2 символа'
			}
		});
	}

	try {
		const existingUser = await prisma.user.findUnique({ where: { login } });

		if (existingUser) {
			return res
				.status(409)
				.send({ message: 'Пользователь уже зарегистрирован' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const { id } = await prisma.user.create({
			data: {
				login,
				password: hashedPassword,
				userName,
				photo,
				createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});

		const payload = { id, login, userName, photo };
		const { accessToken, refreshToken } = generateTokens(payload);

		await prisma.refreshSession.create({
			data: {
				userId: id,
				refreshToken,
				fingerPrint: fingerprint?.hash!,
				createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});

		res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN);

		res.status(201).send({
			message: 'Пользователь успешно зарегистрировался',
			accessToken,
			accessTokenExpiration: ACCESS_TOKEN_EXPIRATION
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
};

const loginUser = async (req: Request, res: Response) => {
	const { login, password } = req.body;
	const { fingerprint } = req;

	if (!login || !password) {
		return res.status(400).send({
			message: 'Все поля обязательны для заполнения',
			hint: {
				login: 'string',
				password: 'string'
			}
		});
	}

	try {
		const user = await prisma.user.findUnique({ where: { login } });

		if (!user || !(await bcrypt.compare(password, user.password!))) {
			return res.status(400).json({ message: 'Неверный логин или пароль' });
		}

		const existingSession = await prisma.refreshSession.findFirst({
			where: { userId: user.id, fingerPrint: fingerprint?.hash }
		});

		const payload = {
			id: user.id,
			login,
			userName: user.userName,
			photo: user.photo
		};
		const { accessToken, refreshToken } = generateTokens(payload);

		if (existingSession) {
			await prisma.refreshSession.update({
				where: { id: existingSession.id },
				data: {
					refreshToken,
					updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
				}
			});
		} else {
			await prisma.refreshSession.create({
				data: {
					userId: user.id,
					refreshToken,
					fingerPrint: fingerprint?.hash!,
					createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
					updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
				}
			});
		}

		res.cookie('refreshToken', refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN);

		res.status(200).send({
			accessToken,
			accessTokenExpiration: ACCESS_TOKEN_EXPIRATION
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
};

const logoutUser = async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refreshToken;

	try {
		await prisma.refreshSession.deleteMany({
			where: { refreshToken }
		});

		res.clearCookie('refreshToken');
		res.status(200).send({ message: 'Пользователь успешно вышел из системы' });
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
};

const refreshToken = async (req: Request, res: Response) => {
	const { refreshToken: tokenFromCookie } = req.cookies;
	const { fingerprint } = req;

	if (!tokenFromCookie) {
		return res.status(401).send({ message: 'Refresh token не предоставлен' });
	}

	try {
		const payload = jwt.verify(
			tokenFromCookie,
			process.env.REFRESH_TOKEN_SECRET!
		) as jwt.JwtPayload;
		const existingSession = await prisma.refreshSession.findFirst({
			where: { refreshToken: tokenFromCookie }
		});

		if (!existingSession) {
			return res
				.status(401)
				.send({ message: 'Недействительный refresh token' });
		}

		if (existingSession.fingerPrint !== fingerprint?.hash) {
			return res.status(401).send({ message: 'Недействительный fingerprint' });
		}

		const newPayload = {
			id: payload.id,
			login: payload.login,
			userName: payload.userName,
			photo: payload.photo
		};
		const { accessToken, refreshToken: newRefreshToken } =
			generateTokens(newPayload);

		await prisma.refreshSession.update({
			where: { id: existingSession.id },
			data: {
				refreshToken: newRefreshToken,
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});

		res.cookie('refreshToken', newRefreshToken, COOKIE_SETTINGS.REFRESH_TOKEN);

		res
			.status(200)
			.send({ accessToken, accessTokenExpiration: ACCESS_TOKEN_EXPIRATION });
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
};

const forgotPassword = async (req: Request, res: Response) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).send({
			message: 'Все поля обязательны для заполнения',
			hint: {
				email: 'string'
			}
		});
	}

	const emailRegex = /^\S+@\S+\.\S+$/i;
	if (!emailRegex.test(email)) {
		return res.status(400).send({
			message: 'Неверный формат email',
			hint: {
				email: 'Введите корректный email адрес'
			}
		});
	}

	// 	const resetPasswordHtml = `
	//     <div style="font-family: Arial, sans-serif; color: #333;">
	//         <table align="center" width="600" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #ddd; margin: 0 auto;">
	//             <tr>
	//                 <td align="center" bgcolor="#f7f7f7" style="padding: 20px;">
	//                     <h1 style="color: #9336fd;">Account Password Reset</h1>
	//                 </td>
	//             </tr>
	//             <tr>
	//                 <td align="center" bgcolor="#ffffff" style="padding: 20px;">
	//                     <p style="font-size: 18px; margin: 0;">Hello,</p>
	//                     <p style="font-size: 16px; margin: 10px 0;">We received a request to reset your account password.</p>
	//                     <p style="font-size: 16px; margin: 10px 0;">Click the button below to reset your password:</p>
	//                     <a href="https://yourwebsite.com/reset-password?token=YOUR_RESET_TOKEN" style="background-color: #9336fd; color: #ffffff; padding: 15px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">Reset Password</a>
	//                     <p style="font-size: 16px; margin: 10px 0;">If you did not request a password reset, please ignore this email or contact support.</p>
	//                 </td>
	//             </tr>
	//             <tr>
	//                 <td align="center" bgcolor="#f7f7f7" style="padding: 20px;">
	//                     <p style="font-size: 14px; margin: 0;">Thank you,<br>The ElchoDev Team</p>
	//                     <p style="font-size: 14px; margin: 0;">Need help? Contact us at <a href="mailto:boss.armsport@gmail.com">boss.armsport@gmail.com</a></p>
	//                 </td>
	//             </tr>
	//         </table>
	//     </div>
	// `;

	const resetPasswordHtml = `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <table align="center" width="600" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #ddd; margin: 0 auto;">
            <tr>
                <td align="center" bgcolor="#f7f7f7" style="padding: 20px;">
                    <h1 style="color: #9336fd;">Сброс пароля аккаунта</h1>
                </td>
            </tr>
            <tr>
                <td align="center" bgcolor="#ffffff" style="padding: 20px;">
                    <p style="font-size: 18px; margin: 0;">Здравствуйте,</p>
                    <p style="font-size: 16px; margin: 10px 0;">Мы получили запрос на сброс пароля для вашего аккаунта.</p>
                    <p style="font-size: 16px; margin: 10px 0;">Нажмите кнопку ниже, чтобы сбросить пароль:</p>
                    <a href="https://yourwebsite.com/reset-password?token=YOUR_RESET_TOKEN" style="background-color: #9336fd; color: #ffffff; padding: 15px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">Сбросить пароль</a>
                    <p style="font-size: 16px; margin: 10px 0;">Если вы не запрашивали сброс пароля, проигнорируйте это письмо или свяжитесь со службой поддержки.</p>
                </td>
            </tr>
            <tr>
                <td align="center" bgcolor="#f7f7f7" style="padding: 20px;">
                    <p style="font-size: 14px; margin: 0;">Спасибо,<br>Команда ElchoDev</p>
                    <p style="font-size: 14px; margin: 0;">Нужна помощь? Свяжитесь с нами по адресу <a href="mailto:boss.armsport@gmail.com">boss.armsport@gmail.com</a></p>
                </td>
            </tr>
        </table>
    </div>
`;

	const resetPasswordText = `
Hello,

We received a request to reset your account password.
Click the link below to reset your password:
https://yourwebsite.com/reset-password?token=YOUR_RESET_TOKEN

If you did not request a password reset, please ignore this email or contact support.

Thank you,
The ElchoDev Team

Need help? Contact us at boss.armsport@gmail.com
`;

	const mailOptions = {
		from: '"ElchoDev" <boss.armsport@gmail.com>',
		to: email,
		subject: 'Reset your password',
		text: resetPasswordText,
		html: resetPasswordHtml
	};

	try {
		await mailer.sendMail(mailOptions);
		res.status(200).send({ message: 'Password reset email sent successfully' });
	} catch (error) {
		console.error('Error sending email:', error);
		res.status(500).send({ message: 'Internal server error' });
	}
};

const getUser = async (req: Request, res: Response) => {
	const data = await prisma.user.findUnique({
		where: { login: req.user?.login }
	});

	if (!data) {
		return res
			.status(404)
			.json({ message: 'Пользователь не прошел проверку подлинности' });
	}

	res.status(200).send({ profile: data });
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ message: 'Токен не предоставлен' });
	}

	const accessToken = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
		// @ts-ignore
		req.user = decoded;
		next();
	} catch (err) {
		res.status(403).json({ message: 'Invalid access token' });
	}
};

export default {
	getRedisData,
	postRedisData,
	loginUser,
	registerUser,
	logoutUser,
	refreshToken,
	forgotPassword,
	getUser,
	authenticateToken
};
