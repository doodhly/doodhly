import { createClient } from 'redis';
import logger from './logger';

export class RedisMutex {
    private client: ReturnType<typeof createClient>;
    private lockKey: string;
    private lockValue: string;
    private ttl: number; // Time to live in seconds

    constructor(lockKey: string, ttl = 300) {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        this.lockKey = `mutex:${lockKey}`;
        this.lockValue = `${process.pid}-${Date.now()}`; // Unique value for this process
        this.ttl = ttl;

        this.client.on('error', (err) => {
            logger.error('Redis Mutex Error:', err);
        });
    }

    async connect(): Promise<void> {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    /**
     * Acquire lock with retry logic
     * @param retries Number of retry attempts
     * @param retryDelay Delay between retries in ms
     * @returns true if lock acquired, false otherwise
     */
    async acquire(retries = 3, retryDelay = 1000): Promise<boolean> {
        await this.connect();

        for (let i = 0; i < retries; i++) {
            try {
                // SET NX (set if not exists) with expiration
                const result = await this.client.set(this.lockKey, this.lockValue, {
                    NX: true, // Only set if key doesn't exist
                    EX: this.ttl, // Expire after TTL seconds
                });

                if (result === 'OK') {
                    logger.info(`✓ Lock acquired: ${this.lockKey}`);
                    return true;
                }

                // Lock exists, check who owns it
                const currentOwner = await this.client.get(this.lockKey);
                logger.info(`⏳ Lock held by: ${currentOwner}. Retrying in ${retryDelay}ms... (${i + 1}/${retries})`);

                if (i < retries - 1) {
                    await this.sleep(retryDelay);
                }
            } catch (error) {
                logger.error(`Error acquiring lock (attempt ${i + 1}):`, error);
            }
        }

        logger.error(`✗ Failed to acquire lock after ${retries} attempts`);
        return false;
    }

    /**
     * Release the lock (only if we own it)
     */
    async release(): Promise<boolean> {
        await this.connect();

        try {
            // Lua script to ensure we only delete if we own the lock
            const luaScript = `
                if redis.call("GET", KEYS[1]) == ARGV[1] then
                    return redis.call("DEL", KEYS[1])
                else
                    return 0
                end
            `;

            const result = await this.client.eval(luaScript, {
                keys: [this.lockKey],
                arguments: [this.lockValue],
            });

            if (result === 1) {
                logger.info(`✓ Lock released: ${this.lockKey}`);
                return true;
            } else {
                logger.warn(`⚠ Lock not owned by this process or already released`);
                return false;
            }
        } catch (error) {
            logger.error('Error releasing lock:', error);
            return false;
        }
    }

    /**
     * Extend lock TTL (useful for long-running processes)
     */
    async extend(additionalTtl: number = 60): Promise<boolean> {
        await this.connect();

        try {
            const result = await this.client.expire(this.lockKey, this.ttl + additionalTtl);
            if (result) {
                logger.info(`✓ Lock extended by ${additionalTtl}s`);
                return true;
            }
            return false;
        } catch (error) {
            logger.error('Error extending lock:', error);
            return false;
        }
    }

    /**
     * Disconnect from Redis
     */
    async disconnect(): Promise<void> {
        if (this.client.isOpen) {
            await this.client.quit();
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Helper function to run a function with mutex protection
 */
export async function withMutex<T>(
    lockKey: string,
    fn: () => Promise<T>,
    ttl = 300
): Promise<T | null> {
    const mutex = new RedisMutex(lockKey, ttl);

    try {
        const acquired = await mutex.acquire();
        if (!acquired) {
            logger.error('Could not acquire lock. Another instance may be running.');
            return null;
        }

        // Run the protected function
        const result = await fn();
        return result;
    } finally {
        await mutex.release();
        await mutex.disconnect();
    }
}
