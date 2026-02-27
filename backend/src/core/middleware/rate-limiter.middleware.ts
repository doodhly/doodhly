import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../../config/redis';
import logger from '../utils/logger';

const getRateLimitStore = () => {
    if (process.env.DISABLE_REDIS === 'true') return undefined; // Memory store

    try {
        return new RedisStore({
            // @ts-ignore
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        });
    } catch (error) {
        logger.warn('Redis unavailable for rate-limiting, using memory store.');
        return undefined;
    }
};

const createLimiter = (windowMs: number, max: number, message: string) => {
    // Relax limits in development/test
    const limit = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? max * 100 : max;

    return rateLimit({
        windowMs,
        max: limit,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED', message } },
        standardHeaders: true,
        legacyHeaders: false,
        store: getRateLimitStore(),
        handler: (req, res, next, options) => {
            logger.warn(`Rate limit exceeded for IP ${req.ip} on ${req.originalUrl}`);
            res.status(options.statusCode).send(options.message);
        },
    });
};

/**
 * General API Limiter: 100 requests per minute
 */
export const generalLimiter = createLimiter(
    1 * 60 * 1000,
    100,
    'Too many requests. Please try again after a minute.'
);

/**
 * OTP Request Limiter: 5 attempts per 15 minutes per IP
 * (Ideally should also include phone number in logic, but IP-based is a solid start)
 */
export const otpRequestLimiter = createLimiter(
    15 * 60 * 1000,
    5,
    'Too many OTP requests. Please try again after 15 minutes.'
);

/**
 * OTP Verify Limiter: 10 attempts per 15 minutes
 */
export const otpVerifyLimiter = createLimiter(
    15 * 60 * 1000,
    10,
    'Too many verification attempts. Please try again after 15 minutes.'
);

/**
 * Wallet Operations Limiter: 30 requests per minute
 */
export const walletLimiter = createLimiter(
    1 * 60 * 1000,
    30,
    'Too many wallet transactions. Please wait a moment.'
);
