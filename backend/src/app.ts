import express from 'express';
import { AppError } from './core/errors/app-error';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './core/utils/logger';
import rateLimit from 'express-rate-limit';

const app = express();

// 🚀 TOTAL DEVELOPMENT PERMISSIVENESS
// 1. Manual Aggressive CORS & No-Cache (Must be first)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (process.env.NODE_ENV === 'development') {
        // Force CORS
        if (origin) res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning, bypass-tunnel-reminder, x-pinggy-no-interstitial');
        res.header('Access-Control-Allow-Credentials', 'true');

        // FORCE NO-CACHE (Prevents 304/CORS rejection issues)
        res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');

        console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    }

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Dynamic Security Headers (Relaxed in dev)
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : undefined,
    crossOriginResourcePolicy: process.env.NODE_ENV === 'development' ? false : { policy: "cross-origin" },
    crossOriginOpenerPolicy: process.env.NODE_ENV === 'development' ? false : { policy: "same-origin" },
}));

// JSON Parser must be BEFORE routes
app.use(express.json());

// Request Logging
const stream = {
    write: (message: string) => logger.http(message.trim()),
};
app.use(morgan(':method :url :status :response-time ms', { stream }));

// Audit Logging (Captures user context for mutations)
import { auditLog } from './core/middleware/audit.middleware';
app.use(auditLog);

// Import Routes
import { authRouter } from './modules/auth/auth.controller';
import { walletRouter } from './modules/customer/wallet/wallet.controller';
import { jobsRouter } from './modules/admin/jobs.controller';
import { subscriptionRouter } from './modules/customer/subscriptions/subscription.controller';
import { customerRouter } from './modules/customer/customer.controller';
import { deliveryRouter } from './modules/delivery/delivery.controller';
import { adminRouter } from './modules/admin/admin.controller';
import { paymentRouter } from './modules/payment/payment.controller';

// Loosen Rate Limits for mobile testing
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 99999 : 500,
    message: 'Too many requests'
});

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'development' ? 1000 : 20,
    message: 'Too many attempts'
});

// Mount Routes
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/customer', customerRouter);
app.use('/api/v1/customer/wallet', walletRouter);
app.use('/api/v1/customer/subscriptions', subscriptionRouter);
app.use('/api/v1/delivery', deliveryRouter);
app.use('/api/v1/admin', adminRouter);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Check if it's an operational error (AppError or has statusCode)
    const statusCode = err.statusCode || 500;
    const isAppError = err.isOperational || err instanceof AppError;
    const message = err.message || 'Internal Server Error';

    if (statusCode === 500) {
        logger.error(`${req.method} ${req.url} Error: ${message}`, { status: statusCode });
    } else {
        logger.warn(`${req.method} ${req.url}: ${message}`);
    }

    res.status(statusCode).json({
        error: {
            code: isAppError ? 'APP_ERROR' : 'INTERNAL_ERROR',
            message: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

export default app;
