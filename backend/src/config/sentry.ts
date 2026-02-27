import * as Sentry from '@sentry/node';

/**
 * Initialize Sentry for Error Tracking
 * Minimal configuration for MVP launch
 */
export function initializeSentry() {
    if (!process.env.SENTRY_DSN) {
        console.log('⚠️  Sentry DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',

        // Sample rate for performance monitoring (10% of transactions)
        tracesSampleRate: 0.1,

        // Filter out sensitive data
        beforeSend(event, hint) {
            // Remove request bodies (may contain passwords/tokens)
            if (event.request) {
                delete event.request.data;
                delete event.request.headers?.authorization;
                delete event.request.headers?.cookie;
            }
            return event;
        },

        // Ignore common errors
        ignoreErrors: [
            'CORS error',
            'Network request failed',
            'Non-Error promise rejection captured'
        ],

        // Enable only in production/staging
        enabled: process.env.NODE_ENV !== 'development'
    });

    console.log('✓ Sentry initialized for error tracking');
}

/**
 * Capture error manually (for try-catch blocks)
 */
export function captureError(error: Error, context?: Record<string, any>) {
    Sentry.captureException(error, {
        extra: context
    });
}

/**
 * Add user context to errors
 */
export function setUserContext(userId: string, email?: string) {
    Sentry.setUser({
        id: userId,
        email
    });
}

/**
 * Sentry Express Error Handler
 * Called from main app setup
 */
export function setupSentryErrorHandler(app: any) {
    if (process.env.SENTRY_DSN) {
        Sentry.setupExpressErrorHandler(app);
    }
}
