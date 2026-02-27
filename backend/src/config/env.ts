import logger from '../core/utils/logger';

export const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN,
};

/**
 * Validates CORS configuration based on the environment.
 * Refuses to let the app start in production if CORS_ORIGIN is undefined or a wildcard.
 */
export function validateCorsConfig() {
    const { NODE_ENV, CORS_ORIGIN } = config;

    if (NODE_ENV === 'production') {
        if (!CORS_ORIGIN) {
            logger.error('FATAL: CORS_ORIGIN is not defined in production environment.');
            process.exit(1);
        }

        if (CORS_ORIGIN === '*') {
            logger.error('FATAL: Dangerous wildcard (*) detected in CORS_ORIGIN in production.');
            process.exit(1);
        }

        logger.info(`✅ CORS production origin locked to: ${CORS_ORIGIN}`);
    } else {
        logger.info('⚠️ CORS running in development mode (relaxed for localhost/testing).');
    }
}

export const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const { NODE_ENV, CORS_ORIGIN } = config;

        // 1. Production: Strict match
        if (NODE_ENV === 'production') {
            if (origin === CORS_ORIGIN) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS policy'));
        }

        // 2. Development: Allow local sources and tools
        const allowedDevOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5000',
            undefined // Allow tools like Postman/insomnia in dev
        ];

        if (allowedDevOrigins.includes(origin) || (origin && origin.includes('localhost'))) {
            return callback(null, true);
        }

        callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'ngrok-skip-browser-warning',
        'bypass-tunnel-reminder',
        'x-pinggy-no-interstitial'
    ],
};
