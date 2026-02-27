
import cron from 'node-cron';
import { inventoryForecastService } from './inventory.service';
import logger from '../../core/utils/logger';

export const initInventoryCron = () => {
    // Run at 11:00 PM every day
    cron.schedule('0 23 * * *', async () => {
        logger.info('Starting nightly inventory forecast...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            await inventoryForecastService.generateForecastForDate(tomorrow);
            logger.info('Nightly inventory forecast complete.');
        } catch (err) {
            logger.error('Nightly inventory forecast failed', err);
        }
    });

    logger.info('Inventory forecast cron scheduled (Daily @ 23:00)');
};
