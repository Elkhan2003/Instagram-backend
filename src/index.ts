process.env.TZ = 'UTC+6';
import { WebSocketServer } from 'ws';
import { buildServer } from './app';
import WebSocketHandlers from './modules/chats/chats.controller';

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
			}
		);

		// Create WebSocket server
		const wss = new WebSocketServer({ server: httpServer });

		wss.on('connection', (ws) => {
			console.log('New client connected');

			ws.on('message', (message: string) => {
				const parsedMessage = JSON.parse(message.toString());
				const { action, resource, url } = parsedMessage;

				switch (action) {
					case 'getUser':
						WebSocketHandlers.getUser(ws);
						break;
					default:
						ws.send(
							JSON.stringify({
								error: 'Unknown action'
							})
						);
				}
			});

			ws.on('close', () => {
				console.log('Client disconnected');
			});
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};
start();
