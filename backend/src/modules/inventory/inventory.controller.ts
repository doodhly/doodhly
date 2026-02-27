
import { Request, Response } from 'express';
import db from '../../config/db';
import { inventoryForecastService } from './inventory.service';
import logger from '../../core/utils/logger';

export class InventoryController {

    public getForecast = async (req: Request, res: Response): Promise<void> => {
        try {
            const dateStr = req.query.date as string || new Date().toISOString().split('T')[0];

            // Fetch forecasts
            const forecasts = await db('inventory_forecasts')
                .where('date', dateStr)
                .orderBy('product_name', 'asc');

            // If no forecasts exist for today/tomorrow, maybe trigger generation?
            // For now, just return empty or what exists.

            res.status(200).json({
                date: dateStr,
                forecasts
            });
        } catch (error) {
            logger.error('Get Forecast Error', error);
            res.status(500).json({ message: 'Failed to fetch inventory forecast' });
        }
    };

    public triggerForecast = async (req: Request, res: Response): Promise<void> => {
        try {
            const dateStr = req.body.date as string; // YYYY-MM-DD
            if (!dateStr) {
                res.status(400).json({ message: 'Date is required' });
                return;
            }

            await inventoryForecastService.generateForecastForDate(new Date(dateStr));

            res.status(200).json({ message: 'Forecast generation triggered' });
        } catch (error) {
            logger.error('Trigger Forecast Error', error);
            res.status(500).json({ message: 'Failed to trigger forecast' });
        }
    };
}
