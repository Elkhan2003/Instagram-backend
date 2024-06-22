"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
const connectPrisma = async () => {
    try {
        await prisma.$connect();
        console.log('Prisma Client Connected');
    }
    catch (err) {
        console.error('Failed to connect to Prisma', err);
    }
};
connectPrisma();
