
import db from '../../config/db';
import { MLClient } from './ml.client';

const mlClient = new MLClient();

export class AnalyticsService {

    async refreshAnalytics(userId: number) {
        const now = new Date();
        const monthYear = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

        // 1. Get Predictions from Python ML Service
        const [consumption, churn] = await Promise.all([
            mlClient.predictConsumption(userId),
            mlClient.predictChurn(userId)
        ]);

        // 2. Calculate Realized Savings (Heuristic: Subscription usually 10% cheaper than MRP)
        // Fetch actual delivered quantity this month
        const usage = await db('daily_deliveries as dd')
            .join('subscriptions as s', 'dd.subscription_id', 's.id')
            .sum('s.quantity as total')
            .where({ 'dd.user_id': userId, 'dd.status': 'DELIVERED' })
            .andWhereRaw('MONTH(dd.date) = ?', [now.getMonth() + 1])
            .andWhereRaw('YEAR(dd.date) = ?', [now.getFullYear()])
            .first();

        const totalLiters = usage?.total || 0;
        const savings = totalLiters * 5; // Assume ₹5 saving per liter on subscription

        // 3. Upsert Analytics Record
        await db('consumption_analytics')
            .insert({
                user_id: userId,
                month_year: monthYear,
                predicted_liters: consumption.predicted_liters || 0,
                churn_probability: churn.churn_probability || 0,
                savings_amount: savings,
                last_analyzed_at: new Date()
            })
            .onConflict(['user_id', 'month_year'])
            .merge();

        return {
            monthYear,
            predicted_liters: consumption.predicted_liters,
            churn_probability: churn.churn_probability,
            savings
        };
    }

    async getDashboardStats(userId: number) {
        const now = new Date();
        const monthYear = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

        const stats = await db('consumption_analytics')
            .where({ user_id: userId, month_year: monthYear })
            .first();

        if (!stats) {
            return this.refreshAnalytics(userId);
        }

        // Refresh if older than 24 hours
        const lastAnalyzed = new Date(stats.last_analyzed_at).getTime();
        if (Date.now() - lastAnalyzed > 24 * 60 * 60 * 1000) {
            return this.refreshAnalytics(userId); // Background refresh could be better, but blocking for now is safer
        }

        return stats;
    }
}
