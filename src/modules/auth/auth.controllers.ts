import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const SECRET_KEY = 'Elcho911';

interface usersType {
	login: string;
	password: string;
	photo: string;
}

let users: usersType[] = [];

const registrationUser = async (req: Request, res: Response) => {
	const { login, password, photo } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);

	const user = { login, password: hashedPassword, photo };
	users.push(user);

	res.status(201).send({ message: 'User registered successfully' });
};

const loginUser = async (req: Request, res: Response) => {
	const { login, password } = req.body;

	const user = users.find((u) => u.login === login);
	if (!user) {
		return res.status(400).json({ message: 'Invalid login or password' });
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		return res.status(400).json({ message: 'Invalid login or password' });
	}

	const token = jwt.sign({ login: user.login }, SECRET_KEY, {
		expiresIn: '1h'
	});
	res.status(200).send({ token });
};

const getUser = async (req: Request, res: Response) => {
	const user = users.find((u) => u.login === req.user?.login);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	res.status(200).send({ profile: user });
};

// Middleware для проверки токена
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ message: 'No token provided' });
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
