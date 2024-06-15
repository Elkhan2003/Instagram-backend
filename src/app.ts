import { config } from 'dotenv';
config();
import express from 'express';
import routes from './routes/index';

interface usersType {
	login: string;
	password: string;
	photo: string;
}

declare global {
	namespace Express {
		interface User extends usersType {}
	}
}

export const buildServer = () => {
	const server = express();

	// Middleware
	server.use(express.urlencoded({ extended: true }));
	server.use(express.json());

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
