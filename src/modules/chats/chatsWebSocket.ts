import { WebSocketServer, WebSocket } from 'ws';
import { Server, IncomingMessage } from 'http';
import moment from 'moment';

interface User {
	ws: WebSocket;
	name: string;
	email: string;
	image?: string;
}

interface Message {
	type: string;
	message: string;
	name: string;
	email: string;
	timestamp: string;
}

interface Room {
	users: User[];
	messages: Message[];
}

const rooms: Record<string, Room> = {}; // Хранилище комнат
const connectedUsers: User[] = []; // Хранилище всех подключенных пользователей

const sortEmails = (emails: string): string => {
	return emails.split('+').sort().join('+');
};

const handleMessage = (ws: WebSocket, payload: any): void => {
	let { message, name, email } = payload;
	const roomId = sortEmails(payload.roomId);

	if (!rooms[roomId]) {
		// Комната не существует, создаем новую
		rooms[roomId] = {
			users: [],
			messages: []
		};
	}

	// Проверяем, добавлен ли пользователь в комнату
	let user = rooms[roomId].users.find((user) => user.ws === ws);
	if (!user) {
		// Добавляем пользователя в комнату
		user = { ws, name, email };
		rooms[roomId].users.push(user);
	}

	const msg: Message = {
		type: 'message',
		message: message,
		name: name,
		email: email,
		timestamp: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
	};

	// Добавляем сообщение в массив сообщений комнаты
	rooms[roomId].messages.push(msg);

	// Отправляем весь массив сообщений всем пользователям в комнате, включая отправителя
	rooms[roomId].users.forEach((user) => {
		user.ws.send(
			JSON.stringify({
				type: 'messageHistory',
				payload: rooms[roomId].messages
			})
		);
	});
};

const handleGetMessages = (ws: WebSocket, payload: any): void => {
	const roomId = sortEmails(payload.roomId);

	if (!rooms[roomId]) {
		// Комната не существует, создаем новую
		rooms[roomId] = {
			users: [],
			messages: []
		};
	}

	// Отправляем весь массив сообщений пользователю, запрашивающему их
	ws.send(
		JSON.stringify({
			type: 'messageHistory',
			payload: rooms[roomId].messages
		})
	);
};

const handleCallRequest = (ws: WebSocket, payload: any): void => {
	const { callUrl, email, name, image } = payload;

	// Ищем пользователя среди всех подключенных
	const user = connectedUsers.find((user) => user.email === email);
	if (user) {
		user.ws.send(
			JSON.stringify({
				type: 'callRequest',
				payload: { callUrl, email, name, image }
			})
		);
	} else {
		ws.send(JSON.stringify({ error: 'User not connected' }));
	}
};

const handleUserLeft = (ws: WebSocket): void => {
	for (const roomId in rooms) {
		const index = rooms[roomId].users.findIndex((user) => user.ws === ws);
		if (index !== -1) {
			rooms[roomId].users.splice(index, 1);

			// Отправляем сообщение о выходе пользователя
			rooms[roomId].users.forEach((user) => {
				user.ws.send(
					JSON.stringify({
						type: 'userLeft',
						payload: { userId: ws, name: rooms[roomId].users[index]?.name }
					})
				);
			});

			// Оставляем комнату и ее сообщения, даже если в ней больше нет пользователей
			if (rooms[roomId].users.length === 0) {
				// Комната остается в памяти с пустым списком пользователей
				rooms[roomId].users = [];
			}
		}
	}

	// Удаляем пользователя из глобального списка подключенных пользователей
	const userIndex = connectedUsers.findIndex((user) => user.ws === ws);
	if (userIndex !== -1) {
		connectedUsers.splice(userIndex, 1);
	}
};

const handleWebSocketMessage = (ws: WebSocket, message: string): void => {
	try {
		const parsedMessage = JSON.parse(message);
		const { type, ...payload } = parsedMessage;

		switch (type) {
			case 'message':
				handleMessage(ws, payload);
				break;
			case 'getMessage':
				handleGetMessages(ws, payload);
				break;
			case 'callRequest':
				handleCallRequest(ws, payload);
				break;
			case 'connect':
				// Добавляем пользователя в глобальный список подключенных пользователей
				connectedUsers.push({
					ws,
					name: payload.name,
					email: payload.email,
					image: payload.image
				});
				break;
			default:
				ws.send(JSON.stringify({ error: 'Invalid message type' }));
		}
	} catch (error) {
		console.error('Error parsing message:', error);
		ws.send(JSON.stringify({ error: 'Invalid message format' }));
	}
};

const handleConnection = (ws: WebSocket, req: IncomingMessage): void => {
	ws.on('message', (message: string) => {
		handleWebSocketMessage(ws, message);
	});

	ws.on('close', () => {
		handleUserLeft(ws);
	});
};

export const initializeWebSocket = (httpServer: Server): WebSocketServer => {
	const wss = new WebSocketServer({ server: httpServer });
	wss.on('connection', handleConnection);
	return wss;
};
