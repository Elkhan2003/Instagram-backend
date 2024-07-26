import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../plugins/prisma';
import { redis } from '../../plugins/redis';
import { mailer } from '../../plugins/mailer';

const generateTokens = (payload: object) => {
	const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '15m'
	});
	const accessTokenExpiration = new Date().getTime() + 15 * 60 * 1000;
	const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: '15d'
	});
	return { accessToken, accessTokenExpiration, refreshToken };
};

const registerUser = async (req: Request, res: Response) => {
	try {
		const { email, password, username, photo } = req.body;
		const { fingerprint } = req;

		// Валидация структуры запроса и полей
		if (
			typeof req.body !== 'object' ||
			!email ||
			!password ||
			!username ||
			!photo
		) {
			return res.status(400).send({
				message: 'Все поля обязательны для заполнения',
				hint: {
					email: 'string',
					password: 'string',
					username: 'string',
					photo: 'string'
				}
			});
		}

		// Валидация длины полей
		if (
			email.length < 2 ||
			password.length < 8 ||
			username.length < 2 ||
			photo.length < 2
		) {
			return res.status(400).send({
				message: 'Все поля должны содержать минимум 2 символа',
				hint: {
					email: 'минимум 2 символа',
					password: 'минимум 8 символа',
					username: 'минимум 2 символа',
					photo: 'минимум 2 символа'
				}
			});
		}

		// Валидация формата email
		const emailRegex = /^\S+@\S+\.\S+$/i;
		if (!emailRegex.test(email)) {
			return res.status(400).send({
				message: 'Неверный формат email',
				hint: {
					email: 'Введите корректный email адрес'
				}
			});
		}

		// Проверка на существование пользователя с таким email
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return res
				.status(409)
				.send({ message: 'Пользователь уже зарегистрирован' });
		}

		// Хэширование пароля
		const hashedPassword = await bcrypt.hash(password, 10);

		// Создание нового пользователя
		const { id } = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				username,
				photo,
				createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});

		// Генерация токенов
		const payload = { id, email, username, photo };
		const { accessToken, accessTokenExpiration, refreshToken } =
			generateTokens(payload);

		// Создание новой сессии
		await prisma.refreshSession.create({
			data: {
				userId: id,
				refreshToken,
				fingerPrint: fingerprint?.hash!,
				createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});

		// Возвращение успешного ответа
		res.status(201).send({
			message: 'Пользователь успешно зарегистрировался',
			accessToken,
			accessTokenExpiration,
			refreshToken
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
};

const loginUser = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const { fingerprint } = req;

		// Валидация структуры запроса и полей
		if (
			typeof req.body !== 'object' ||
			!email ||
			!password ||
			typeof email !== 'string' ||
			typeof password !== 'string'
		) {
			return res.status(400).send({
				message:
					'Неправильный формат запроса или все поля обязательны для заполнения',
				hint: {
					email: 'string',
					password: 'string'
				}
			});
		}

		// Валидация формата email
		const emailRegex = /^\S+@\S+\.\S+$/i;
		if (!emailRegex.test(email)) {
			return res.status(400).send({
				message: 'Неверный формат email',
				hint: {
					email: 'Введите корректный email адрес'
				}
			});
		}

		// Поиск пользователя в базе данных
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(400).json({ message: 'Неверный логин или пароль' });
		}

		// Проверка пароля
		const isPasswordValid = await bcrypt.compare(password, user.password!);
		if (!isPasswordValid) {
			return res.status(400).json({ message: 'Неверный логин или пароль' });
		}

		// Поиск существующей сессии
		const existingSession = await prisma.refreshSession.findFirst({
			where: { userId: user.id, fingerPrint: fingerprint?.hash }
		});

		// Генерация токенов
		const payload = {
			id: user.id,
			email,
			username: user.username,
			photo: user.photo
		};
		const { accessToken, accessTokenExpiration, refreshToken } =
			generateTokens(payload);

		// Обновление или создание новой сессии
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

		// Возвращаем токены клиенту
		res.status(200).send({
			accessToken,
			accessTokenExpiration,
			refreshToken
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const logoutUser = async (req: Request, res: Response) => {
	try {
		await prisma.refreshSession.deleteMany({
			where: { userId: req.user?.id }
		});
		res.status(200).send({ message: 'Пользователь успешно вышел из системы' });
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
};

const refreshToken = async (req: Request, res: Response) => {
	const { refreshToken: tokenFromBody } = req.body;
	const { fingerprint } = req;
	if (!tokenFromBody) {
		return res.status(401).send({ message: 'Refresh token не предоставлен' });
	}
	try {
		const payload = jwt.verify(
			tokenFromBody,
			process.env.REFRESH_TOKEN_SECRET!
		) as jwt.JwtPayload;
		const existingSession = await prisma.refreshSession.findFirst({
			where: { refreshToken: tokenFromBody }
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
			email: payload.email,
			username: payload.username,
			photo: payload.photo
		};
		const {
			accessToken,
			accessTokenExpiration,
			refreshToken: newRefreshToken
		} = generateTokens(newPayload);
		await prisma.refreshSession.update({
			where: { id: existingSession.id },
			data: {
				refreshToken: newRefreshToken,
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});
		res.status(200).send({
			accessToken,
			accessTokenExpiration,
			refreshToken: newRefreshToken
		});
	} catch (error) {
		console.error(error);
		res.status(401).send({ message: 'JsonWebTokenError: invalid token' });
	}
};

const forgotPassword = async (req: Request, res: Response) => {
	const { frontEndUrl, email } = req.body;

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

	if (!frontEndUrl) {
		return res.status(400).send({
			message: 'URL фронтенда обязателен',
			hint: {
				frontEndUrl: 'string'
			}
		});
	}

	// Регулярное выражение для проверки допустимого домена
	const domainRegex = /^https?:\/\/[^\/]+/;
	const matchedDomain = frontEndUrl.match(domainRegex);

	if (!matchedDomain) {
		return res.status(400).send({
			message: 'Недопустимый домен',
			hint: {
				frontEndUrl: 'Введите корректный URL с допустимым доменом'
			}
		});
	}

	try {
		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			return res.status(404).send({ message: 'Пользователь не найден' });
		}

		const resetToken: string = jwt.sign(
			{ id: user.id },
			process.env.RESET_PASSWORD_TOKEN_SECRET!,
			{
				expiresIn: '15m'
			}
		);

		await redis.setData(`resetToken:${user.id}`, resetToken, 3 * 60);

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
                            <a href="${matchedDomain[0]}/auth/reset-password?token=${resetToken}" style="background-color: #9336fd; color: #ffffff; padding: 15px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">Сбросить пароль</a>
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
${matchedDomain[0]}/auth/reset-password?token=${resetToken}

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

		await mailer.sendMail(mailOptions);
		res.status(200).send({ message: 'Password reset email sent successfully' });
	} catch (error) {
		console.error('Error sending email:', error);
		res.status(500).send({ message: 'Internal server error' });
	}
};

const resetPassword = async (req: Request, res: Response) => {
	try {
		const { token, newPassword } = req.body;

		// Валидация структуры запроса и полей
		if (typeof req.body !== 'object' || !token || !newPassword) {
			return res.status(400).send({
				message: 'Все поля обязательны для заполнения',
				hint: {
					token: 'string',
					newPassword: 'string'
				}
			});
		}

		// Валидация длины пароля
		if (newPassword.length < 2) {
			return res.status(400).send({
				message: 'Пароль должен содержать минимум 2 символа',
				hint: {
					newPassword: 'минимум 2 символа'
				}
			});
		}

		// Проверка токена
		const decoded = jwt.verify(
			token,
			process.env.RESET_PASSWORD_TOKEN_SECRET!
		) as jwt.JwtPayload;
		const { id } = decoded;

		// Проверка существования токена в Redis
		const storedToken = await redis.getData(`resetToken:${id}`);
		if (!storedToken || storedToken !== token) {
			return res
				.status(400)
				.send({ message: 'Неверный или просроченный токен сброса пароля' });
		}

		// Хэширование нового пароля
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Обновление пароля пользователя в базе данных
		await prisma.user.update({
			where: { id },
			data: {
				password: hashedPassword,
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});

		// Удаление токена сброса из Redis
		await redis.deleteData(`resetToken:${id}`);

		// Возвращение успешного ответа
		res.status(200).send({ message: 'Пароль успешно сброшен' });
	} catch (error) {
		console.error('Error resetting password:', error);
		if (error instanceof jwt.JsonWebTokenError) {
			return res
				.status(400)
				.send({ message: 'Неверный или просроченный токен сброса пароля' });
		}
		res.status(500).send({ message: 'Internal server error' });
	}
};

const getUser = async (req: Request, res: Response) => {
	const data = await prisma.user.findUnique({
		where: { email: req.user?.email }
	});

	if (!data) {
		return res
			.status(404)
			.json({ message: 'Пользователь не прошел проверку подлинности' });
	}

	const userData = {
		id: data.id,
		username: data.username,
		role: data.role,
		email: data.email,
		isActive: data.isActive,
		photo: data.photo,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt
	};

	res.status(200).send({ profile: userData });
};

export default {
	loginUser,
	registerUser,
	logoutUser,
	refreshToken,
	forgotPassword,
	resetPassword,
	getUser
};
