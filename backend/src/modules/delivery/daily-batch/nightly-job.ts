
import db from '../../../config/db';
import { WalletService } from '../../customer/wallet/wallet.service';
import { SubscriptionService } from '../../customer/subscriptions/subscription.service';
import { randomBytes } from 'crypto';

const walletService = new WalletService();
const subService = new SubscriptionService();

function generateSecureCode(): string {
    return randomBytes(4).toString('hex').toUpperCase(); // 8 char unique code
}

export class NightlyJob {

    async generateDailyDeliveries(targetDate: string, cityId: string) {
        // 1. Get Active Subscriptions
        const subs = await subService.getActiveSubsForDate(cityId, targetDate);
        console.log(`Found ${subs.length} active subscriptions for ${cityId}`);

        for (const sub of subs) {
            // 2. Idempotency Check (Read-only, no lock needed yet)
            const exists = await db('daily_deliveries')
                .where({ subscription_id: sub.id, date: targetDate })
                .first();

            if (exists) {
                console.log(`Skipping sub ${sub.id}: Already generated.`);
                continue;
            }

            // Start Transaction PER SUBSCRIPTION
            const trx = await db.transaction();

            try {
                // 3. Financial Check & Execute
                const price = sub.price || 5000; // Default 50 INR (in Paisa)

                await walletService.debitWallet(sub.user_id, price, `DELIVERY-${targetDate}-${sub.id}`, trx);

                // 4. Create Delivery Record
                const [deliveryId] = await db('daily_deliveries').transacting(trx).insert({
                    city_id: cityId,
                    subscription_id: sub.id,
                    user_id: sub.user_id,
                    date: targetDate,
                    status: 'PENDING',
                    debit_amount_paisa: price,
                    proof_type: 'COUPON'
                });

                // 5. Generate Physical Coupon
                const code = generateSecureCode();
                await db('coupons').transacting(trx).insert({
                    code: code,
                    linked_delivery_id: deliveryId,
                    status: 'CREATED'
                });

                await trx.commit(); // Success for this user

            } catch (err: any) {
                await trx.rollback(); // Rollback only this user

                if (err.message === 'INSUFFICIENT_FUNDS') {
                    console.warn(`Skipping sub ${sub.id}: Low Balance`);
                } else {
                    console.error(`Failed to process sub ${sub.id}`, err);
                    // Continue to next sub, don't crash job
                }
            }
        }
        console.log('Batch Job Completed');
    }
}
