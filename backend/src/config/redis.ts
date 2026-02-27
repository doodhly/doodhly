import { createClient } from 'redis';
import logger from '../core/utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
    url: redisUrl
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('✅ Connected to Redis'));

// Initialize connection
(async () => {
    if (process.env.DISABLE_REDIS === 'true') {
        logger.info('⚠️ Redis disabled via configuration. Skipping connection.');
        return;
    }
    try {
        await redisClient.connect();
    } catch (err) {
        logger.error('Failed to connect to Redis', err);
    }
})();
