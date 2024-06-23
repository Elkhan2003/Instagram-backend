import { config } from 'dotenv';
config();
import express from 'express';
import routes from './routes/index';
import Fingerprint from 'express-fingerprint';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocumentation from './swagger.json';

interface usersType {
	email: string;
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

	// swagger
	server.use(
		'/api-docs',
		swaggerUi.serve,
		swaggerUi.setup(swaggerDocumentation)
	);

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
	// server.use((req, res, next) => {
	// 	res.header('Access-Control-Allow-Origin', '*'); // замените "*" на ваш список разрешенных доменов, если необходимо
	// 	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
	// 	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	// 	next();
	// });

	server.get('/', (req, res) => {
		res.status(200).send({
			message: 'Hello World!'
		});
	});

	server.use('/api/v1', routes);

	return server;
};
