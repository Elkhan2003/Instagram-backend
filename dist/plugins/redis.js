"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisPlugin = void 0;
const redis_1 = require("redis");
class RedisPlugin {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({
            password: 'LMffLiL6U8cmn0ntKU6ZptXkb5UwUKXH',
            socket: {
                host: 'redis-12711.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
                port: 12711
            }
        });
        this.client.on('error', (err) => console.log('Redis Client Error', err));
    }
    async connect() {
        try {
            await this.client.connect();
            console.log('Redis Client Connected');
        }
        catch (err) {
            console.error('Failed to connect to Redis', err);
        }
    }
    getClient() {
        return this.client;
    }
    async setData(key, value) {
        try {
            await this.client.set(key, JSON.stringify(value));
            console.log(`Data set for key: ${key}`);
        }
        catch (err) {
            console.error('Failed to set data in Redis', err);
        }
    }
    async getData(key) {
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (err) {
            console.error('Failed to get data from Redis', err);
        }
    }
}
exports.redisPlugin = new RedisPlugin();
exports.redisPlugin.connect();
