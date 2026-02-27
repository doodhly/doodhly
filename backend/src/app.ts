import 'express-async-errors'; // Async error handling
import express from 'express';
import { AppError } from './core/errors/app-error';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import logger from './core/utils/logger';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './config/swagger';

import { config, validateCorsConfig, corsOptions } from './config/env';
import healthRoutes from './modules/health/health.routes';

const app = express();

// Validate CORS at startup
validateCorsConfig();

// 1. Parsers & Cookies
app.use(express.json());
app.use(cookieParser());

// 2. Strict CORS Policy
app.use(cors(corsOptions));

// 3. Security Headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production', // Only strict CSP in production
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
}));

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
import { calendarRouter } from './modules/delivery/calendar.controller';
import { deliveryRouter } from './modules/delivery/delivery.controller';
import { analyticsRouter } from './modules/analytics/analytics.controller';
import { adminRouter } from './modules/admin/admin.controller';
import { paymentRouter } from './modules/payment/payment.controller';
import routeOptimizationRouter from './modules/route-optimization/route-optimization.routes';

// Import Tiered Rate Limiters
import {
    generalLimiter,
    otpRequestLimiter,
    otpVerifyLimiter,
    walletLimiter
} from './core/middleware/rate-limiter.middleware';

// Apply General Rate Limiter to all requests
app.use(generalLimiter);

// Mount Routes with specific limiters
app.use('/api/v1/auth/otp', otpRequestLimiter);
app.use('/api/v1/auth/login', otpVerifyLimiter);
app.use('/api/v1/auth', authRouter);

app.use('/api/v1/payment', walletLimiter, paymentRouter);
app.use('/api/v1/customer/wallet', walletLimiter, walletRouter);

app.use('/api/v1/customer', customerRouter);
app.use('/api/v1/customer/subscriptions', subscriptionRouter);
app.use('/api/v1/delivery', deliveryRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/admin/jobs', jobsRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/partner', routeOptimizationRouter);
import inventoryRouter from './modules/inventory/inventory.routes';
app.use('/api/v1/admin/inventory', inventoryRouter);

// API Documentation (Swagger)
setupSwagger(app);

// Health Check Endpoints
app.use('/api', healthRoutes);

// Global Error Handler
import { setupSentryErrorHandler } from './config/sentry';
setupSentryErrorHandler(app);

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
