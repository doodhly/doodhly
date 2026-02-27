import { Worker, Job } from 'bullmq';
import { connection } from '../../../core/queue/queue.config';
import db from '../../../config/db';
import { WalletService } from '../../customer/wallet/wallet.service';
import { randomBytes } from 'crypto';
import logger from '../../../core/utils/logger';

const walletService = new WalletService();

function generateSecureCode(): string {
    return randomBytes(4).toString('hex').toUpperCase(); // 8 char unique code
}

export const deliveryWorker = connection ? new Worker(
    'delivery-generation',
    async (job: Job) => {
        const { sub, targetDate, cityId } = job.data;

        logger.info(`Processing delivery for sub ${sub.id} on ${targetDate}`);

        // 1. Idempotency Check
        const exists = await db('daily_deliveries')
            .where({ subscription_id: sub.id, date: targetDate })
            .first();

        if (exists) {
            logger.info(`Skipping sub ${sub.id}: Already generated.`);
            return;
        }

        // 2. Start Transaction
        const trx = await db.transaction();

        try {
            const price = sub.price || 5000;

            // 3. Financial Check & Debit
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

            await trx.commit();
            logger.info(`✅ Successfully processed sub ${sub.id}`);

        } catch (err: any) {
            await trx.rollback();
            if (err.message === 'INSUFFICIENT_FUNDS') {
                logger.warn(`Skipping sub ${sub.id}: Low Balance`);
            } else {
                logger.error(`Failed to process sub ${sub.id}`, err);
                throw err; // Re-throw to BullMQ for retry
            }
        }
    },
    { connection: connection as any } // Cast because BullMQ expects ConnectionOptions but can take ioredis instance
) : null;
