
import db from '../../config/db';
import logger from '../../core/utils/logger';

interface ForecastInput {
    date: string; // YYYY-MM-DD
}

export class InventoryForecastService {

    // Weighted Moving Average Weights
    private readonly WEIGHTS = {
        SAME_DAY_LAST_WEEK: 0.5,
        YESTERDAY: 0.3,
        WEEK_AGO: 0.2
    };

    private readonly SAFETY_BUFFER = 1.1; // +10%

    public async generateForecastForDate(targetDate: Date): Promise<void> {
        const dateStr = targetDate.toISOString().split('T')[0];
        logger.info(`Generating forecast for ${dateStr}...`);

        // 1. Identify active products (from recent deliveries via subscriptions -> products)
        const products = await db('daily_deliveries')
            .leftJoin('subscriptions', 'daily_deliveries.subscription_id', 'subscriptions.id')
            .leftJoin('products', 'subscriptions.product_id', 'products.id')
            .distinct('products.name as product_name')
            .where('daily_deliveries.date', '>', db.raw("DATE_SUB(?, INTERVAL 30 DAY)", [dateStr]))
            .whereNotNull('products.name');

        // And sectors (for now 'ALL')
        const sectors = ['ALL'];

        for (const p of products) {
            for (const s of sectors) {
                const predicted = await this.calculateWMA(p.product_name, s, targetDate);

                await db('inventory_forecasts')
                    .insert({
                        date: dateStr,
                        product_name: p.product_name,
                        product_id: 0, // Placeholder
                        sector: s,
                        predicted_qty: Math.ceil(predicted * this.SAFETY_BUFFER),
                        created_at: new Date(),
                        updated_at: new Date()
                    })
                    .onConflict(['date', 'sector', 'product_name'])
                    .merge(['predicted_qty', 'updated_at']);
            }
        }
        logger.info(`Forecast generation complete for ${dateStr}`);
    }

    private async calculateWMA(productName: string, sector: string, targetDate: Date): Promise<number> {
        // 1. Get stats
        const yesterday = new Date(targetDate);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastWeek = new Date(targetDate);
        lastWeek.setDate(lastWeek.getDate() - 7);

        // We need stats for Yesterday, Last Week Same Day, and maybe 7 Days Ago (which is same as Last Week Same Day?)
        // The formula was: (0.5 * LastSameWeekday) + (0.3 * Yesterday) + (0.2 * 7DaysAgo) -> 7DaysAgo IS LastSameWeekday.
        // Maybe the formula meant: (0.5 * LastSameWeekday) + (0.3 * Yesterday) + (0.2 * 2WeeksAgoSameWeekday)?
        // Or (0.5 * LastWeek) + (0.3 * Yesterday) + (0.2 * DayBeforeYesterday)?
        // Let's stick to user prompt: "(0.5 * LastSameWeekday) + (0.3 * Yesterday) + (0.2 * 7DaysAgo)"
        // If 7DaysAgo == LastSameWeekday, then it is 0.7 * LastWeek + 0.3 * Yesterday.
        // Let's assume that.

        const qtyYesterday = await this.getQty(productName, yesterday);
        const qtyLastWeek = await this.getQty(productName, lastWeek);

        // If we have no history, fallback to yesterday or 0
        if (qtyLastWeek === 0 && qtyYesterday === 0) return 0;
        if (qtyLastWeek === 0) return qtyYesterday;

        return (0.7 * qtyLastWeek) + (0.3 * qtyYesterday);
    }

    private async getQty(productName: string, date: Date): Promise<number> {
        const dateStr = date.toISOString().split('T')[0];
        const res = await db('daily_deliveries')
            .sum('subscriptions.quantity as total')
            .leftJoin('subscriptions', 'daily_deliveries.subscription_id', 'subscriptions.id')
            .leftJoin('products', 'subscriptions.product_id', 'products.id')
            .where('daily_deliveries.date', dateStr)
            .whereNot('daily_deliveries.status', 'CANCELLED')
            .where('products.name', productName)
            .first();

        return Number(res?.total || 0);
    }
}

export const inventoryForecastService = new InventoryForecastService();
