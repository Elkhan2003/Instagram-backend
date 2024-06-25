process.env.TZ = 'UTC+6';
import { buildServer } from './app';
import { initializeWebSocket } from './modules/chats/chatsWebSocket';

const server = buildServer();
const start = async () => {
	const PORT: any = process.env.PORT || 3000;

	try {
		const httpServer = server.listen(
			{
				port: PORT,
				host: '0.0.0.0'
			},
			() => {
				console.log(`${new Date()}`);
				console.log('server running at: http://localhost:' + PORT);
				console.log('server running at: ws://localhost:' + PORT);
			}
		);

		initializeWebSocket(httpServer);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};
start();
