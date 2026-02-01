
import { Router, Request, Response, NextFunction } from 'express';
import { DeliveryVerificationService } from './verification/coupon.service';
import { requireAuth, restrictTo } from '../../core/middleware/auth.middleware';
import { AppError } from '../../core/errors/app-error';

import { DeliveryService } from './delivery.service';

const router = Router();
const verificationService = new DeliveryVerificationService();
const deliveryService = new DeliveryService();

// All routes require DELIVERY_PARTNER role
router.use(requireAuth, restrictTo('DELIVERY_PARTNER'));

router.get('/sync', async (req: Request, res: Response, next: NextFunction) => {
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

        const results = [];

        for (const update of updates) {
            try {
                // Determine Action
                if (update.type === 'COUPON') {
                    if (!update.code) throw new Error('Code missing');
                    await verificationService.verifyCoupon(update.code, req.user!.id);
                    results.push({ id: update.id, success: true, status: 'DELIVERED' });
                }
                else if (update.type === 'ISSUE') {
                    if (!update.reason) throw new Error('Reason missing');
                    // Uses delivery ID from update.id (which assumes update.id IS daily_delivery_id)
                    await verificationService.reportIssue(update.id, update.reason, req.user!.id, Number(req.user!.city_id));
                    results.push({ id: update.id, success: true, status: 'MISSED' });
                } else {
                    results.push({ id: update.id, success: false, error: 'Unknown Type' });
                }
            } catch (err: any) {
                // Idempotency: If already scanned/refunded, treat as success or specific warning
                if (err.message === 'ALREADY_SCANNED' || err.status === 'ALREADY_REFUNDED') {
                    results.push({ id: update.id, success: true, status: 'ALREADY_DONE' });
                } else {
                    results.push({ id: update.id, success: false, error: err.message });
                }
            }
        }

        res.status(200).json({ results });
    } catch (err) {
        next(err);
    }
});

export const deliveryRouter = router;
