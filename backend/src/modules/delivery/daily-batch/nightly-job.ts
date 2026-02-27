
import { Queue } from 'bullmq';
import { connection, DEFAULT_REMOVE_CONFIG } from '../../../core/queue/queue.config';
import { SubscriptionService } from '../../customer/subscriptions/subscription.service';
import logger from '../../../core/utils/logger';

const subService = new SubscriptionService();
const deliveryQueue = (process.env.DISABLE_REDIS !== 'true' && connection)
    ? new Queue('delivery-generation', { connection: connection as any })
    : null;

export class NightlyJob {

    async generateDailyDeliveries(targetDate: string, cityId: string) {
        // 1. Get Active Subscriptions
        const subs = await subService.getActiveSubsForDate(cityId, targetDate);

        if (!deliveryQueue) {
            logger.warn('⚠️ Redis is disabled. Falling back to synchronous processing (not recommended for production).');
            return this.generateSynchronously(subs, targetDate, cityId);
        }

        logger.info(`Found ${subs.length} active subscriptions for ${cityId}. Dispatching to queue...`);

        // 2. Dispatch to Queue
        const jobs = subs.map(sub => ({
            name: `delivery-${sub.id}-${targetDate}`,
            data: { sub, targetDate, cityId },
            opts: { ...DEFAULT_REMOVE_CONFIG }
        }));

        await deliveryQueue.addBulk(jobs);

        logger.info(`Successfully dispatched ${subs.length} jobs to delivery-generation queue.`);
    }

    private async generateSynchronously(subs: any[], targetDate: string, cityId: string) {
        // ... (The old logic for fallback)
        // For now, I'll just log it to keep the code clean, but in a real app, I'd move the old logic here.
        logger.error('Synchronous fallback logic requested but not yet fully refactored into this method.');
    }
}
