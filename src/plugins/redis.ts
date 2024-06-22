import { createClient, RedisClientType } from 'redis';

interface IRedisPlugin {
	client: RedisClientType;
	connect: () => Promise<void>;
	getClient: () => RedisClientType;
	setData: (key: string, value: any, ttl?: number) => Promise<void>;
	getData: (key: string) => Promise<any>;
	deleteData: (key: string) => Promise<void>;
}

class RedisPlugin implements IRedisPlugin {
	client: RedisClientType;

	constructor() {
		this.client = createClient({
			password: process.env.REDIS_PASSWORD!,
			socket: {
				host: process.env.REDIS_HOST!,
				port: Number(process.env.REDIS_PORT!)
			}
		});

		this.client.on('error', (err) => console.log('Redis Client Error', err));
	}

	async connect() {
		try {
			await this.client.connect();
			console.log('Redis Client Connected');
		} catch (err) {
			console.error('Failed to connect to Redis', err);
		}
	}

	getClient(): RedisClientType {
		return this.client;
	}

	async setData(key: string, value: any, ttl?: number): Promise<void> {
		try {
			let dataToStore: string;

			if (typeof value === 'object') {
				dataToStore = JSON.stringify(value);
			} else {
				dataToStore = JSON.stringify(value);
			}

			// console.log(`Setting data for key: ${key} with value: ${dataToStore}`);
			if (ttl) {
				await this.client.set(key, dataToStore, { EX: ttl });
				// console.log(`Data set for key: ${key} with TTL: ${ttl} seconds`);
			} else {
				await this.client.set(key, dataToStore);
				// console.log(`Data set for key: ${key} with no TTL`);
			}
		} catch (err) {
			console.error('Failed to set data in Redis', err);
		}
	}

	async getData(key: string): Promise<any> {
		try {
			const data = await this.client.get(key);
			// console.log(`Retrieved data for key: ${key}: ${data}`);
			return data ? JSON.parse(data) : null;
		} catch (err) {
			console.error('Failed to get data from Redis', err);
		}
	}

	async deleteData(key: string): Promise<void> {
		try {
			await this.client.del(key);
			// console.log(`Deleted data for key: ${key}`);
		} catch (err) {
			console.error('Failed to delete data from Redis', err);
		}
	}
}

export const redis = new RedisPlugin();
redis.connect();
