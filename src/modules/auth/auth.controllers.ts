import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../plugins/prisma';
import { ACCESS_TOKEN_EXPIRATION, COOKIE_SETTINGS } from '../../constants';

const generateTokens = (payload: object) => {
	const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '1h'
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
				fingerPrint: fingerprint?.hash!
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

		const payload = {
			id: user.id,
			login,
			userName: user.userName,
			photo: user.photo
		};
		const { accessToken, refreshToken } = generateTokens(payload);

		await prisma.refreshSession.create({
			data: {
				userId: user.id,
				refreshToken,
				fingerPrint: fingerprint?.hash!
			}
		});

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
	loginUser,
	registerUser,
	logoutUser,
	getUser,
	authenticateToken
};
