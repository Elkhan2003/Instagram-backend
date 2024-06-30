import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import moment from 'moment';

interface ParsedMessage {
	event: string;
	message?: string;
	username?: string;
	email?: string;
	room?: string;
	time?: string;
}

interface ChatData {
	[room: string]: ParsedMessage[];
}

const chatData: ChatData = {};

export const initializeWebSocket = (httpServer: Server): WebSocketServer => {
	const wss = new WebSocketServer({ server: httpServer });

	wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
		ws.on('message', (message: string) => {
			try {
				const parsedMessage: ParsedMessage = JSON.parse(message);
				handleIncomingMessage(wss, ws, parsedMessage);
			} catch (error) {
				console.error('Error parsing message:', error);
				ws.send(JSON.stringify({ error: 'Invalid message format' }));
			}
		});

		ws.on('close', () => {
			console.log('Client disconnected');
		});
	});

	return wss;
};

const handleIncomingMessage = (
	wss: WebSocketServer,
	ws: WebSocket,
	message: ParsedMessage
): void => {
	if (message.room) {
		const emails = message.room.split('+').sort();
		message.room = `${emails[0]}+${emails[1]}`;
		message.time = moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z');
	}

	let currentRoom: string | null = null;
	switch (message.event) {
		case 'sendChatMessage':
			handleSendChatMessage(wss, ws, message);
			currentRoom = message.room!;
			break;
		case 'getChatMessage':
			handleGetChatMessage(wss, ws, message);
			currentRoom = message.room!;
			break;
		case 'subscribe':
		case 'notify':
			handleNotificationMessage(wss, ws, message);
			break;
		default:
			ws.send(JSON.stringify({ error: 'Unknown event' }));
	}

	ws.on('close', () => {
		console.log(`Client disconnected from room: ${currentRoom}`);
	});
};

const handleSendChatMessage = (
	wss: WebSocketServer,
	ws: WebSocket,
	message: ParsedMessage
): void => {
	const { room } = message;
	if (!room) {
		ws.send(JSON.stringify({ error: 'Room not specified' }));
		return;
	}
	saveChatMessage(room, message);
	broadcastMessage(wss, room, message, ws);
};

const handleGetChatMessage = (
	wss: WebSocketServer,
	ws: WebSocket,
	message: ParsedMessage
) => {
	const { room } = message;
	if (!room) {
		ws.send(JSON.stringify({ error: 'Room not specified' }));
		return;
	}
	broadcastMessage(wss, room!, message, ws);
};

const handleNotificationMessage = (
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
			broadcastMessage(wss, '', message, ws);
			break;
		default:
			ws.send(JSON.stringify({ error: 'Unknown action' }));
	}
};

const broadcastMessage = (
	wss: WebSocketServer,
	room: string,
	message: ParsedMessage,
	ws: WebSocket
): void => {
	const chatHistory = chatData[room] || [];
	//
	// ws.send(
	// 	JSON.stringify({ event: message.event, messages: chatHistory })
	// );

	wss.clients.forEach((client: WebSocket) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(
				JSON.stringify({ event: message.event, messages: chatHistory })
			);
		}
	});
};

const saveChatMessage = (room: string, message: ParsedMessage): void => {
	if (!chatData[room]) {
		chatData[room] = [];
	}
	chatData[room].push(message);
};
