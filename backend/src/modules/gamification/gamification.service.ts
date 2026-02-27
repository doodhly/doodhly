
import db from '../../config/db';
import { WalletService } from '../customer/wallet/wallet.service';

const walletService = new WalletService();

export class GamificationService {

    /**
     * Process all gamification hooks for a delivered order
     */
    async processDeliveryRewards(userId: number, deliveryDate: Date, trx: any) {
        await this.handleReferral(userId, trx);
        await this.handleStreak(userId, deliveryDate, trx);
    }

    /**
     * Check and process Pending Referral
     */
    private async handleReferral(userId: number, trx: any) {
        // 1. Check for Pending Referral where this user is the Referee
        const referral = await db('referrals')
            .transacting(trx)
            .where({ referee_id: userId, status: 'PENDING' })
            .first();

        if (referral) {
            console.log(`[Gamification] Processing Referral ${referral.id}`);

            // 2. Mark Completed
            await db('referrals')
                .transacting(trx)
                .where({ id: referral.id })
                .update({
                    status: 'COMPLETED',
                    completed_at: new Date()
                });

            // 3. Credit Referrer
            await walletService.creditWallet(
                referral.referrer_id.toString(),
                referral.reward_amount_paisa,
                `REF-BONUS-${referral.id}`,
                'REFERRAL_BONUS' as any, // Cast as any if type column enum not strict in Typescript yet
                trx
            );

            // 4. Credit Referee (The current user)
            await walletService.creditWallet(
                referral.referee_id.toString(),
                referral.reward_amount_paisa,
                `REF-WELCOME-${referral.id}`,
                'REFERRAL_BONUS' as any,
                trx
            );
        }
    }

    /**
     * Update Streak Logic
     */
    private async handleStreak(userId: number, currentDeliveryDate: Date, trx: any) {
        // 1. Get User's Streak Count
        const user = await db('users').transacting(trx).where({ id: userId }).first();
        if (!user) return;

        // 2. Find Last Delivered Order Date (Before today/current delivery)
        const lastDelivery = await db('daily_deliveries')
            .transacting(trx)
            .where({ user_id: userId, status: 'DELIVERED' })
            .whereNot({ date: currentDeliveryDate })
            .orderBy('date', 'desc')
            .first();

        let newStreak = 1;

        if (lastDelivery) {
            const lastDate = new Date(lastDelivery.date);
            const currentDate = new Date(currentDeliveryDate);

            // Calculate difference in days
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive Day
                newStreak = user.streak_count + 1;
            } else if (diffDays === 0) {
                // Same day delivery (multiple orders?) -> Keep same streak
                newStreak = user.streak_count;
            } else {
                // Streak Broken
                newStreak = 1;
            }
        }

        // 3. Update User
        // Only update if changed
        if (newStreak !== user.streak_count) {
            await db('users').transacting(trx).where({ id: userId }).update({ streak_count: newStreak });
        }

        // 4. Check for Streak Reward (30 Days)
        if (newStreak === 30 && user.streak_count !== 30) { // Trigger only on hitting 30
            console.log(`[Gamification] User ${userId} hit 30 day streak!`);
            await walletService.creditWallet(
                userId.toString(),
                10000, // 100 Rupees
                `STREAK-30-${Date.now()}`,
                'STREAK_REWARD' as any,
                trx
            );
            // Reset streak to 0
            await db('users').transacting(trx).where({ id: userId }).update({ streak_count: 0 });
        }
    }
}
