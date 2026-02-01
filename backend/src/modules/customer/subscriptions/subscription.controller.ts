
import { Router, Request, Response, NextFunction } from 'express';
import { SubscriptionService } from './subscription.service';
import { requireAuth } from '../../../core/middleware/auth.middleware';
import { AppError } from '../../../core/errors/app-error';

const router = Router();
const subService = new SubscriptionService();

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cityId = req.user?.city_id || 1; // Fallback to 1 (Sakti) if context missing
        const result = await subService.createSubscription(req.user!.id, cityId.toString(), req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subs = await subService.getUserSubscriptions(req.user!.id);
        res.status(200).json(subs);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/pause', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { start_date, end_date } = req.body;
        if (!start_date) throw new AppError('start_date required', 400);

        await subService.pauseSubscription(req.user!.id, req.params.id as string, start_date, end_date);
        res.status(200).json({ message: 'Paused' });
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/resume', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await subService.resumeSubscription(req.user!.id, req.params.id as string);
        res.status(200).json({ message: 'Resumed' });
    } catch (err) {
        next(err);
    }
});

export const subscriptionRouter = router;
