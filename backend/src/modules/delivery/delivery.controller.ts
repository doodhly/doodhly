
import { Router, Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import { DeliveryVerificationService } from './verification/coupon.service';
import { requireAuth, restrictTo } from '../../core/middleware/auth.middleware';
import { AppError } from '../../core/errors/app-error';

import { DeliveryService } from './delivery.service';

const router = Router();
const verificationService = new DeliveryVerificationService();
const deliveryService = new DeliveryService();

// Base Auth for all
router.use(requireAuth);

/**
 * GET /api/v1/delivery
 * Customer: Get MY delivery for a specific date
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.query;
        if (!date) throw new AppError('Date query required', 400);

        const delivery = await db('daily_deliveries')
            .where({
                user_id: req.user!.id,
                date: date as string
            })
            .select('*'); // Array (usually 1 or 0)

        res.status(200).json(delivery);
    } catch (err) {
        next(err);
    }
});

// --- PARTNER ONLY ROUTES BELOW ---
const partnerRouter = Router();
partnerRouter.use(restrictTo('DELIVERY_PARTNER'));

partnerRouter.get('/sync', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.query;
        if (!date) throw new AppError('Date query required', 400);

        // Security: Ensure driver fetches for their city (req.user.city_id)
        if (!req.user?.city_id) throw new AppError('No City Context', 403);

        const deliveries = await deliveryService.getRunSheet(req.user.city_id, date as string);

        res.status(200).json({
            date,
            routeId: `R-${date}-${req.user.id}`,
            deliveries
        });
    } catch (err) {
        next(err);
    }
});

router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.body;
        if (!code) throw new AppError('Coupon code required', 400);

        // req.user.id is the driverId
        const result = await verificationService.verifyCoupon(code, req.user!.id);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/report-issue', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { daily_delivery_id, reason } = req.body;
        if (!daily_delivery_id || !reason) throw new AppError('Delivery ID and Reason required', 400);

        // Security: Pass City ID
        const result = await verificationService.reportIssue(daily_delivery_id, reason, req.user!.id, Number(req.user!.city_id));
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * Offline Batch Sync
 * Accepts: { updates: [{ id, type: 'COUPON'|'ISSUE', code?, reason?, timestamp }] }
 */
router.post('/sync/batch', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { updates } = req.body;
        if (!updates || !Array.isArray(updates)) throw new AppError('Invalid updates format', 400);

        const results = await deliveryService.processOfflineBatch(updates, req.user!.id, Number(req.user!.city_id));

        res.status(200).json({ results });
    } catch (err) {
        next(err);
    }
});

// Mount partner routes
router.use('/', partnerRouter);

export const deliveryRouter = router;
