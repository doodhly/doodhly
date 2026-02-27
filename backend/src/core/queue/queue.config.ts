import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const connection = process.env.DISABLE_REDIS !== 'true'
    ? new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
    })
    : null;

export const DEFAULT_REMOVE_CONFIG = {
    removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
        age: 24 * 3600, // keep up to 24 hours
    },
};
