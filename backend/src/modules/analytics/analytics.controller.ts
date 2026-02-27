
import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, restrictTo } from '../../core/middleware/auth.middleware';
import { AnalyticsService } from './analytics.service';

const router = Router();
const analyticsService = new AnalyticsService();

router.use(requireAuth);

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.user!.id);
        const stats = await analyticsService.getDashboardStats(userId);
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Admin trigger for specific user
router.post('/refresh/:userId', restrictTo('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = parseInt(req.params.userId as string);
        const stats = await analyticsService.refreshAnalytics(userId);
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

export const analyticsRouter = router;
