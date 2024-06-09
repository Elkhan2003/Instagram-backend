process.env.TZ = 'UTC+6';
import { WebSocketServer } from 'ws';
import { buildServer } from './app';

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
				const parsedMessage = JSON.parse(message);
				switch (parsedMessage.event) {
					case 'message':
						broadcastMessage(parsedMessage);
						break;
					case 'connection':
						broadcastMessage(parsedMessage);
						break;
					default:
						ws.send(
							JSON.stringify({
								error: 'Unknown action'
							})
						);
				}
			});

			const broadcastMessage = (message: string) => {
				wss.clients.forEach((client) => {
					client.send(JSON.stringify(message));
				});
			};

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
