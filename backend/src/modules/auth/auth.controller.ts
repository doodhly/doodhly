
import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AppError } from '../../core/errors/app-error';

const authService = new AuthService();
const router = Router();

router.post('/otp', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.body;
        if (!phone) throw new AppError('Phone is required', 400);
        const result = await authService.requestOtp(phone);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            throw new AppError('Phone and OTP are required', 400);
        }
        const result = await authService.loginWithPhone(phone, otp);
        res.status(200).json(result);
    } catch (err) {
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
