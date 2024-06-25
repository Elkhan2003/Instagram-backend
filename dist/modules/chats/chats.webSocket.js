"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeChatWebSocket = void 0;
const ws_1 = require("ws");
const initializeChatWebSocket = (httpServer) => {
    const wss = new ws_1.WebSocketServer({ server: httpServer });
    wss.on('connection', (ws) => {
        console.log('New client connected');
        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);
            switch (parsedMessage.event) {
                case 'connection':
                    broadcastMessage(parsedMessage);
                    break;
                case 'message':
                    broadcastMessage(parsedMessage);
                    break;
                default:
                    ws.send(JSON.stringify({
                        error: 'Unknown action'
                    }));
            }
        });
        const broadcastMessage = (message) => {
            wss.clients.forEach((client) => {
                client.send(JSON.stringify(message));
            });
        };
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
    return wss;
};
exports.initializeChatWebSocket = initializeChatWebSocket;
