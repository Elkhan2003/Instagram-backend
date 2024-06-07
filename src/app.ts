import { config } from 'dotenv';
config();
import express from 'express';
// import cors from 'cors';
import routes from './routes/index';
import { User as PrismaUser } from './plugins/prisma';
import { auth } from './plugins/auth';

declare global {
	namespace Express {
		interface User extends PrismaUser {}
	}
}

export const buildServer = () => {
	const server = express();

	// Middleware
	server.use(express.urlencoded({ extended: true }));
	server.use(express.json());
	server.use(auth);

	server.get('/', (req, res) => {
		const user = req.user;
		res.status(200).send({
			message: 'Hello World!',
			user: user || 'The user is not authenticated'
		});
	});

	server.use('/api/v1', routes);

	return server;
};
