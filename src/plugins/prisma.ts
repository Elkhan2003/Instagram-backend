import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

const connectPrisma = async () => {
	try {
		await prisma.$connect();
		console.log('Prisma Client Connected');
	} catch (err) {
		console.error('Failed to connect to Prisma', err);
	}
};
connectPrisma();
export { prisma, User };
