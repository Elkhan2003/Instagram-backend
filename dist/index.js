"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.TZ = 'UTC+6';
const app_1 = require("./app");
const chatsWebSocket_1 = require("./modules/chats/chatsWebSocket");
const server = (0, app_1.buildServer)();
const start = async () => {
    const PORT = process.env.PORT || 3000;
    try {
        const httpServer = server.listen({
            port: PORT,
            host: '0.0.0.0'
        }, () => {
            console.log(`${new Date()}`);
            console.log('server running at: http://localhost:' + PORT);
            console.log('server running at: ws://localhost:' + PORT);
        });
        (0, chatsWebSocket_1.initializeWebSocket)(httpServer);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
start();
