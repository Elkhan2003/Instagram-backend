import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../plugins/prisma';
import moment from 'moment';
const SECRET_KEY = 'Elcho911';

const registrationUser = async (req: Request, res: Response) => {
	const { login, password, userName, photo } = req.body;

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
		const existingUser = await prisma.user.findUnique({
			where: { login: login }
		});

		if (existingUser) {
			return res
				.status(400)
				.send({ message: 'Пользователь уже зарегистрирован' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.create({
			data: {
				login: login,
				password: hashedPassword,
				userName: userName,
				photo: photo,
				createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});

		res.status(201).send({ message: 'Пользователь успешно зарегистрировался' });
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
};

const loginUser = async (req: Request, res: Response) => {
	const { login, password } = req.body;

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
		const user = await prisma.user.findUnique({
			where: { login: login }
		});

		if (!user) {
			return res.status(400).json({ message: 'Неверный логин или пароль' });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password!);
		if (!isPasswordValid) {
			return res.status(400).json({ message: 'Неверный логин или пароль' });
		}

		// Генерируем JWT токен
		const token = jwt.sign({ login: user.login }, SECRET_KEY, {
			expiresIn: '1h'
		});

		res.status(200).send({ token });
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

// Middleware для проверки токена
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ message: 'Токен не предоставлен' });
	}

	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, SECRET_KEY);

		// @ts-ignore
		req.user = decoded;
		next();
	} catch (err) {
		res.status(401).json({ message: 'Invalid token' });
	}
};

export default {
	loginUser,
	registrationUser,
	getUser,
	authenticateToken
};
