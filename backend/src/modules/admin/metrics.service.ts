import db from '../../config/db';
import { AppError } from '../../core/errors/app-error';

export class MetricsService {

    async getDashboardMetrics() {
        try {
            // 1. Total Active vs Paused Subscriptions
            const subStats = await db('subscriptions')
                .select('status')
                .count('id as count')
                .groupBy('status');

            const activeSubs = subStats.find(s => s.status === 'ACTIVE')?.count || 0;
            const pausedSubs = subStats.find(s => s.status === 'PAUSED')?.count || 0;

            // 2. Pending Deliveries for Today
            const today = new Date().toISOString().split('T')[0];
            const deliveryStats = await db('daily_deliveries')
                .where({ date: today })
                .select('status')
                .count('id as count')
                .groupBy('status');

            const pendingDeliveries = deliveryStats.find(s => s.status === 'PENDING')?.count || 0;
            const completedDeliveries = deliveryStats.find(s => s.status === 'DELIVERED')?.count || 0;

            // 3. New Customers (Joined in last 7 days)
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            const newUsers = await db('users')
                .where('created_at', '>=', lastWeek)
                .where('role', 'CUSTOMER')
                .count('id as count')
                .first();

            // 4. Wallet Liquidity (Total money held in wallets)
            const totalWalletBalance = await db('wallets')
                .sum('balance as total')
                .first();

            return {
                subscriptions: {
                    active: activeSubs,
                    paused: pausedSubs,
                },
                deliveries: {
                    today: today,
                    pending: pendingDeliveries,
                    completed: completedDeliveries,
                },
                growth: {
                    newUsersLast7Days: newUsers?.count || 0,
                },
                financials: {
                    totalWalletLiabilityPaisa: totalWalletBalance?.total || 0,
                }
            };

        } catch (error) {
            throw new AppError('Failed to aggregate metrics', 500);
        }
    }
}
