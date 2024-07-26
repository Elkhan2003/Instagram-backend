import { config } from 'dotenv';
config();
import express from 'express';
import routes from './routes/index';
import Fingerprint from 'express-fingerprint';
import swaggerUi from 'swagger-ui-express';
import { IUser } from './types';
import * as swaggerDocumentation from './swagger.json';

declare global {
	namespace Express {
		interface User extends IUser {}
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
