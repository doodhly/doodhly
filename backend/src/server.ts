import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

import Joi from 'joi';
import logger from './core/utils/logger';
import { validateSecrets } from './config/secrets';

function validateEnv() {
    const envSchema = Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(5000),
        DB_HOST: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        CORS_ORIGIN: Joi.string().optional()
    }).unknown();

    const { error } = envSchema.validate(process.env);

    if (error) {
        logger.error(`Config validation error: ${error.message}`);
        process.exit(1);
    }
}

// Validate environment and secrets before starting
validateEnv();
validateSecrets();

import { createServer } from 'http';
import { initSocket } from './socket';

import { initInventoryCron } from './modules/inventory/inventory.cron';

// Initialize Cron Jobs
initInventoryCron();

// Start Workers if Redis is enabled
if (process.env.DISABLE_REDIS !== 'true') {
    import('./modules/delivery/workers/delivery.worker');
} else {
    logger.info('⚠️ Redis disabled: Background workers will not be started.');
}

const httpServer = createServer(app);

async function startServer() {
    try {
        const io = await initSocket(httpServer);

        httpServer.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            console.log(`Socket.io initialized!`);
            console.log('Server ready.');
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
