"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeNotificationWebSocket = void 0;
const ws_1 = require("ws");
const initializeNotificationWebSocket = (httpServer) => {
    const wss = new ws_1.WebSocketServer({
        server: httpServer,
        path: '/notifications'
    });
    wss.on('connection', (ws) => {
        console.log('New notification client connected');
        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);
            switch (parsedMessage.event) {
                case 'subscribe':
                    ws.send(JSON.stringify({
                        event: 'subscribed',
                        data: 'You are subscribed to notifications'
                    }));
                    break;
                case 'notify':
                    broadcastNotification(parsedMessage);
                    break;
                default:
                    ws.send(JSON.stringify({
                        error: 'Unknown action'
                    }));
            }
        });
        const broadcastNotification = (message) => {
            wss.clients.forEach((client) => {
                client.send(JSON.stringify(message));
            });
        };
        ws.on('close', () => {
            console.log('Notification client disconnected');
        });
    });
    return wss;
};
exports.initializeNotificationWebSocket = initializeNotificationWebSocket;
