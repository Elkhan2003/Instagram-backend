"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = void 0;
const ws_1 = require("ws");
const initializeWebSocket = (server) => {
    const wss = new ws_1.WebSocketServer({ server });
    const messages = []; // Массив для хранения всех сообщений
    wss.on('connection', (ws) => {
        console.log('New client connected');
        ws.on('message', (message) => {
            try {
                const parsedMessage = JSON.parse(message);
                switch (parsedMessage.event) {
                    case 'message':
                        handleMessage(parsedMessage);
                        break;
                    case 'connection':
                        handleMessage(parsedMessage);
                        break;
                    default:
                        ws.send(JSON.stringify({ event: 'error', message: 'Unknown event type' }));
                }
            }
            catch (error) {
                console.error('Failed to parse message:', error);
                ws.send(JSON.stringify({ event: 'error', message: 'Failed to parse message' }));
            }
        });
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
    const handleMessage = (message) => {
        const { event, ...data } = message;
        messages.push(data); // Добавляем сообщение в массив
        broadcastMessage(message);
    };
    const broadcastMessage = (message) => {
        // Возвращаем весь массив сообщений
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messages));
            }
        });
    };
};
exports.initializeWebSocket = initializeWebSocket;
