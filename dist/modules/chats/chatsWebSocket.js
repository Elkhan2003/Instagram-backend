"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = void 0;
const ws_1 = require("ws");
const initializeWebSocket = (server) => {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        console.log('New client connected');
        ws.on('message', (message) => {
            try {
                const parsedMessage = JSON.parse(message);
                switch (parsedMessage.event) {
                    case 'message':
                        broadcastMessage(parsedMessage);
                        break;
                    case 'connection':
                        broadcastMessage(parsedMessage);
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
    const broadcastMessage = (message) => {
        // Исправление типа message
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                // Проверка на состояние подключения клиента
                client.send(JSON.stringify(message));
            }
        });
    };
};
exports.initializeWebSocket = initializeWebSocket;
