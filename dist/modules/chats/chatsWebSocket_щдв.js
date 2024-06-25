"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = void 0;
const ws_1 = require("ws");
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
const initializeWebSocket = (httpServer) => {
    const wss = new ws_1.WebSocketServer({ server: httpServer });
    wss.on('connection', (ws, req) => {
        const pathname = req.url || '';
        console.log(`New client connected to ${pathname}`);
        ws.on('message', (message) => {
            console.log(`Received message on ${pathname}:`, message);
            try {
                const parsedMessage = JSON.parse(message);
                handleMessage(wss, pathname, ws, parsedMessage);
            }
            catch (error) {
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
exports.initializeWebSocket = initializeWebSocket;
const handleMessage = (wss, pathname, ws, message) => {
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
const handleChatMessages = (wss, ws, message) => {
    switch (message.event) {
        case 'chat':
            console.log(`Broadcasting message in /chats:`, message);
            broadcastMessage(wss, message);
            break;
        default:
            ws.send(JSON.stringify({ error: 'Unknown action' }));
    }
};
const handleNotificationMessages = (wss, ws, message) => {
    switch (message.event) {
        case 'subscribe':
            ws.send(JSON.stringify({
                event: 'subscribed',
                data: 'You are subscribed to notifications'
            }));
            break;
        case 'notify':
            console.log(`Broadcasting notification:`, message);
            broadcastMessage(wss, message);
            break;
        default:
            ws.send(JSON.stringify({ error: 'Unknown action' }));
    }
};
const broadcastMessage = (wss, message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};
