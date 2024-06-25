import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';

interface ParsedMessage {
	event: string;
	message?: string;
	username?: string;
}

let data = [
	{
		event: 'chat',
		message: 'Hello from Insomnia',
		username: 'Arlen'
	},
	{
		event: 'chat',
		message: 'Hello from Elcho',
		username: 'Madina'
	},
	{
		event: 'chat',
		message: 'Hello from Alex',
		username: 'Francklin'
	}
];

export const initializeWebSocket = (httpServer: Server): WebSocketServer => {
	const wss = new WebSocketServer({ server: httpServer });

	wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
		const pathname = req.url || '';
		console.log(`New client connected to ${pathname}`);

		// Отправка всех сообщений из data новому клиенту
		data.forEach((message) => {
			if (pathname === '/chats' && message.event === 'chat') {
				ws.send(JSON.stringify(message));
			}
		});

		ws.on('message', (message: string) => {
			console.log(`Received message on ${pathname}:`, message);
			try {
				const parsedMessage: ParsedMessage = JSON.parse(message);
				handleMessage(wss, pathname, ws, parsedMessage);
			} catch (error) {
				console.error('Error parsing message:', error);
				ws.send(JSON.stringify({ error: 'Invalid message format' }));
			}
		});

		ws.on('close', () => {
			console.log(`Client disconnected from ${pathname}`);
		});
	});

	return wss;
};

const handleMessage = (
	wss: WebSocketServer,
	pathname: string,
	ws: WebSocket,
	message: ParsedMessage
): void => {
	switch (pathname) {
		case '/chats':
			handleChatMessages(wss, ws, message);
			break;
		case '/notifications':
			handleNotificationMessages(wss, ws, message);
			break;
		default:
			ws.send(JSON.stringify({ error: 'Unknown path' }));
	}
};

const handleChatMessages = (
	wss: WebSocketServer,
	ws: WebSocket,
	message: ParsedMessage
): void => {
	switch (message.event) {
		case 'chat':
			console.log(`Broadcasting message in /chats:`, message);
			broadcastMessage(wss, message);
			break;
		default:
			ws.send(JSON.stringify({ error: 'Unknown action' }));
	}
};

const handleNotificationMessages = (
	wss: WebSocketServer,
	ws: WebSocket,
	message: ParsedMessage
): void => {
	switch (message.event) {
		case 'subscribe':
			ws.send(
				JSON.stringify({
					event: 'subscribed',
					data: 'You are subscribed to notifications'
				})
			);
			break;
		case 'notify':
			console.log(`Broadcasting notification:`, message);
			broadcastMessage(wss, message);
			break;
		default:
			ws.send(JSON.stringify({ error: 'Unknown action' }));
	}
};

const broadcastMessage = (
	wss: WebSocketServer,
	message: ParsedMessage
): void => {
	wss.clients.forEach((client: WebSocket) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(message));
		}
	});
};
