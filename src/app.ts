import { config } from 'dotenv';
config();
import express from 'express';
import routes from './routes/index';
import Fingerprint from 'express-fingerprint';
import cookieParser from 'cookie-parser';

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
	server.use(cookieParser());
	server.use(
		Fingerprint({
			// @ts-ignore
			parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders]
		})
	);

	server.get('/', (req, res) => {
		res.status(200).send({
			message: 'Hello World!'
		});
	});

	server.use('/api/v1', routes);

	return server;
};
