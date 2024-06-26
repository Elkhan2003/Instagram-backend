"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = void 0;
const ws_1 = require("ws");
const chatData = {};
const initializeWebSocket = (httpServer) => {
    const wss = new ws_1.WebSocketServer({ server: httpServer });
    wss.on('connection', (ws, req) => {
        ws.on('message', (message) => {
            console.log(`Received message: ${message}`);
            try {
                const parsedMessage = JSON.parse(message);
                handleIncomingMessage(wss, ws, parsedMessage);
            }
            catch (error) {
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
exports.initializeWebSocket = initializeWebSocket;
const handleIncomingMessage = (wss, ws, message) => {
    let currentRoom = null;
    switch (message.event) {
        case 'chat':
            if (message.room) {
                handleChatMessage(wss, ws, message);
                currentRoom = message.room;
            }
            else {
                ws.send(JSON.stringify({ error: 'Room not specified' }));
            }
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
const handleChatMessage = (wss, ws, message) => {
    const { room } = message;
    if (!room) {
        ws.send(JSON.stringify({ error: 'Room not specified' }));
        return;
    }
    console.log(`Broadcasting message in room ${room}: ${JSON.stringify(message)}`);
    saveChatMessage(room, message);
    broadcastMessage(wss, room, message, ws);
};
const handleNotificationMessage = (wss, ws, message) => {
    switch (message.event) {
        case 'subscribe':
            ws.send(JSON.stringify({
                event: 'subscribed',
                data: 'You are subscribed to notifications'
            }));
            break;
        case 'notify':
            console.log(`Broadcasting notification: ${JSON.stringify(message)}`);
            broadcastMessage(wss, '', message, ws);
            break;
        default:
            ws.send(JSON.stringify({ error: 'Unknown action' }));
    }
};
const broadcastMessage = (wss, room, message, ws) => {
    const chatHistory = chatData[room] || [];
    ws.send(JSON.stringify({ event: 'chat', messages: chatHistory }));
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN && client !== ws) {
            client.send(JSON.stringify(message));
        }
    });
};
const saveChatMessage = (room, message) => {
    if (!chatData[room]) {
        chatData[room] = [];
    }
    chatData[room].push(message);
};
