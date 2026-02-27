
import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AppError } from '../../core/errors/app-error';

import { validate } from '../../core/middleware/validate.middleware';
import { requestOtpSchema, loginSchema } from '../../core/validation/auth.schema';

const authService = new AuthService();
const router = Router();

router.post('/otp', validate(requestOtpSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.requestOtp(req.body.phone);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, otp, referralCode } = req.body;
        const result = await authService.loginWithPhone(phone, otp, referralCode);

        const cookieOptions = {
            httpOnly: true,
            secure: true, // Force Secure in production/dev for consistency with modern browsers
            sameSite: 'strict' as const,
            maxAge: 15 * 60 * 1000 // 15 mins
        };

        const refreshCookieOptions = {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/v1/auth/refresh' // Restrict refresh token to refresh endpoint
        };

        res.cookie('jwt', result.accessToken, cookieOptions);
        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

        res.status(200).json({
            status: 'success',
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user,
            isNewUser: result.isNewUser
        });
    } catch (err) {
        next(err);
    }
});

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie('jwt');
        res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!oldRefreshToken) throw new AppError('No refresh token provided', 401);

        const result = await authService.refresh(oldRefreshToken);

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict' as const,
            maxAge: 15 * 60 * 1000
        };

        const refreshCookieOptions = {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/v1/auth/refresh'
        };

        res.cookie('jwt', result.accessToken, cookieOptions);
        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

        res.status(200).json({
            status: 'success',
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    } catch (err) {
        // Clear cookies on refresh failure to force local re-auth
        res.clearCookie('jwt');
        res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
        next(err);
    }
});

import { requireAuth } from '../../core/middleware/auth.middleware';
import db from '../../config/db';

router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const user = await db('users').where({ id: userId }).first();
        if (!user) throw new AppError('User not found', 404);

        // Update last_seen_at if it's been more than 1 minute since last update
        const now = new Date();
        const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : null;
        if (!lastSeen || (now.getTime() - lastSeen.getTime() > 60000)) {
            await db('users').where({ id: userId }).update({ last_seen_at: now });
        }

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/onboarding', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const result = await authService.completeOnboarding(userId, req.body);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

export const authRouter = router;
