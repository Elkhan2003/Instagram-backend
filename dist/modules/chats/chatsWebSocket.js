"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = void 0;
const ws_1 = require("ws");
const moment_1 = __importDefault(require("moment"));
const rooms = {}; // Хранилище комнат
const connectedUsers = []; // Хранилище всех подключенных пользователей
const sortEmails = (emails) => {
    return emails.split('+').sort().join('+');
};
const handleMessage = (ws, payload) => {
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
    const msg = {
        type: 'message',
        message: message,
        name: name,
        email: email,
        timestamp: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
    };
    // Добавляем сообщение в массив сообщений комнаты
    rooms[roomId].messages.push(msg);
    // Отправляем весь массив сообщений всем пользователям в комнате, включая отправителя
    rooms[roomId].users.forEach((user) => {
        user.ws.send(JSON.stringify({
            type: 'messageHistory',
            payload: rooms[roomId].messages
        }));
    });
};
const handleGetMessages = (ws, payload) => {
    const roomId = sortEmails(payload.roomId);
    if (!rooms[roomId]) {
        // Комната не существует, создаем новую
        rooms[roomId] = {
            users: [],
            messages: []
        };
    }
    // Отправляем весь массив сообщений пользователю, запрашивающему их
    ws.send(JSON.stringify({
        type: 'messageHistory',
        payload: rooms[roomId].messages
    }));
};
const handleCallRequest = (ws, payload) => {
    const { callUrl, email, name, image } = payload;
    // Ищем пользователя среди всех подключенных
    const user = connectedUsers.find((user) => user.email === email);
    if (user) {
        user.ws.send(JSON.stringify({
            type: 'callRequest',
            payload: { callUrl, email, name, image }
        }));
    }
    else {
        ws.send(JSON.stringify({ error: 'User not connected' }));
    }
};
const handleUserLeft = (ws) => {
    for (const roomId in rooms) {
        const index = rooms[roomId].users.findIndex((user) => user.ws === ws);
        if (index !== -1) {
            rooms[roomId].users.splice(index, 1);
            // Отправляем сообщение о выходе пользователя
            rooms[roomId].users.forEach((user) => {
                user.ws.send(JSON.stringify({
                    type: 'userLeft',
                    payload: { userId: ws, name: rooms[roomId].users[index]?.name }
                }));
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
const handleWebSocketMessage = (ws, message) => {
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
    }
    catch (error) {
        console.error('Error parsing message:', error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
};
const handleConnection = (ws, req) => {
    ws.on('message', (message) => {
        handleWebSocketMessage(ws, message);
    });
    ws.on('close', () => {
        handleUserLeft(ws);
    });
};
const initializeWebSocket = (httpServer) => {
    const wss = new ws_1.WebSocketServer({ server: httpServer });
    wss.on('connection', handleConnection);
    return wss;
};
exports.initializeWebSocket = initializeWebSocket;
