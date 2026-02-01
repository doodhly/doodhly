
import { Router, Request, Response, NextFunction } from 'express';
import { NightlyJob } from '../delivery/daily-batch/nightly-job';
import { AppError } from '../../core/errors/app-error';

import { requireAuth, restrictTo } from '../../core/middleware/auth.middleware';

const router = Router();
const nightlyJob = new NightlyJob();

// Protected internal endpoint to trigger batch manually
// In production, this should be protected by a special API KEY or IP Whitelist middleware
router.post('/nightly-batch', requireAuth, restrictTo('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date, city_id } = req.body;

        if (!date || !city_id) {
            throw new AppError('Date (YYYY-MM-DD) and City ID required', 400);
        }

        // Trigger Job
        await nightlyJob.generateDailyDeliveries(date, city_id);

        res.status(200).json({ status: 'success', message: 'Batch Job Triggered' });
    } catch (err) {
        next(err);
    }
});

export const jobsRouter = router;
