import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../types';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ message: 'Токен не предоставлен' });
	}

	const accessToken = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
		req.user = decoded as IUser;
		next();
	} catch (err) {
		res.status(403).json({ message: 'Токен недействителен или истек' });
	}
};

export default authenticateToken;
