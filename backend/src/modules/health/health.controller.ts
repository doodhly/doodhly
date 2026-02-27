import { Request, Response } from 'express';
import db from '../../config/db';
import { createClient } from 'redis';
import logger from '../../core/utils/logger';


const isRedisEnabled = process.env.DISABLE_REDIS !== 'true';
let redis: any = null;

if (isRedisEnabled) {
    redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redis.on('error', (err: any) => logger.error('Redis error in health check:', err));
    (async () => {
        try {
            if (redis) await redis.connect();
        } catch (err) {
            logger.warn('Redis connection failed in health module:', err);
        }
    })();
}

interface HealthCheck {
    healthy: boolean;
    latency?: number;
    error?: string;
    details?: any;
}

interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    services: {
        database: HealthCheck;
        redis: HealthCheck;
        socketio: HealthCheck;
        queues: HealthCheck;
    };
    version: string;
}

async function checkQueues(): Promise<HealthCheck> {
    if (process.env.DISABLE_REDIS === 'true') {
        return { healthy: true, details: { disabled: true } };
    }

    try {
        const { Queue } = require('bullmq');
        const { connection } = require('../../core/queue/queue.config');

        if (!connection) {
            return { healthy: false, error: 'Queue connection not initialized' };
        }

        const deliveryQueue = new Queue('delivery-generation', { connection });
        const [waiting, active, failed] = await Promise.all([
            deliveryQueue.getWaitingCount(),
            deliveryQueue.getActiveCount(),
            deliveryQueue.getFailedCount(),
        ]);

        return {
            healthy: true,
            details: {
                'delivery-generation': { waiting, active, failed }
            }
        };
    } catch (error: any) {
        return { healthy: false, error: error.message };
    }
}

async function checkDatabase(): Promise<HealthCheck> {
    try {
        const start = Date.now();
        await db.raw('SELECT 1');
        const latency = Date.now() - start;

        return {
            healthy: true,
            latency,
            details: {
                pool: {
                    used: (db.client as any).pool.numUsed(),
                    free: (db.client as any).pool.numFree(),
                    pending: (db.client as any).pool.numPendingAcquires(),
                }
            }
        };
    } catch (error: any) {
        logger.error('Database health check failed:', error);
        return {
            healthy: false,
            error: error.message
        };
    }
}

async function checkRedis(): Promise<HealthCheck> {
    if (!redis || !isRedisEnabled) {
        return {
            healthy: true, // Not a failure if intentionally disabled
            details: { disabled: true }
        };
    }

    try {
        const start = Date.now();
        await redis.ping();
        const latency = Date.now() - start;

        return {
            healthy: true,
            latency
        };
    } catch (error: any) {
        logger.warn('Redis health check failed:', error);
        return {
            healthy: false,
            error: error.message
        };
    }
}

function checkSocketIO(): HealthCheck {
    try {
        // Import the IO instance
        const { getIO } = require('../../socket');
        const io = getIO();

        if (!io) {
            return {
                healthy: false,
                error: 'Socket.IO not initialized'
            };
        }

        return {
            healthy: true,
            details: {
                connectedClients: io.engine?.clientsCount || 0,
                namespaces: Array.from(io._nsps.keys())
            }
        };
    } catch (error: any) {
        return {
            healthy: false,
            error: error.message
        };
    }
}

export const healthCheck = async (req: Request, res: Response) => {
    const [database, redisCheck, socketio, queues] = await Promise.all([
        checkDatabase(),
        checkRedis(),
        checkSocketIO(),
        checkQueues(),
    ]);

    const services = { database, redis: redisCheck, socketio, queues };

    // Determine overall status
    const allHealthy = Object.values(services).every(s => s.healthy);

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (allHealthy) {
        status = 'healthy';
    } else if (database.healthy) {
        status = 'degraded';
    } else {
        status = 'unhealthy';
    }

    const response: HealthResponse = {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services,
        version: process.env.npm_package_version || '1.0.0',
    };

    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    res.status(httpStatus).json(response);
};

// Simple liveness probe - just checks if the process is running
export const livenessProbe = (req: Request, res: Response) => {
    res.json({
        alive: true,
        timestamp: new Date().toISOString()
    });
};

// Readiness probe - checks if the app is ready to serve traffic
export const readinessProbe = async (req: Request, res: Response) => {
    const dbCheck = await checkDatabase();

    if (dbCheck.healthy) {
        res.json({
            ready: true,
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(503).json({
            ready: false,
            reason: 'Database unavailable',
            timestamp: new Date().toISOString()
        });
    }
};
