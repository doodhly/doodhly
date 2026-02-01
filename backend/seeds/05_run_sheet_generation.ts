import { Knex } from "knex";

import { randomBytes } from 'crypto';

function generateSecureCode(): string {
    return randomBytes(4).toString('hex').toUpperCase(); // 8 char unique code
}

export async function seed(knex: Knex): Promise<void> {
    const targetDate = '2026-01-31';

    // 1. Get all active subscriptions
    const subs = await knex('subscriptions').where({ status: 'ACTIVE' }).select('*');
    const product = await knex('products').first();
    const price = product?.price_paisa || 6000;

    console.log(`Generating deliveries for ${subs.length} subscriptions for ${targetDate}`);

    for (const sub of subs) {
        // 2. Idempotency Check
        const exists = await knex('daily_deliveries')
            .where({ subscription_id: sub.id, date: targetDate })
            .first();

        if (exists) {
            console.log(`Skipping sub ${sub.id}: Already generated.`);
            continue;
        }

        // 3. Create Delivery Record
        const [deliveryId] = await knex('daily_deliveries').insert({
            city_id: sub.city_id,
            subscription_id: sub.id,
            user_id: sub.user_id,
            date: targetDate,
            status: 'PENDING',
            debit_amount: price,
            proof_type: 'COUPON'
        });

        // 4. Generate Physical Coupon
        const code = generateSecureCode();
        await knex('coupons').insert({
            code: code,
            linked_delivery_id: deliveryId,
            status: 'CREATED'
        });

        console.log(`Created delivery ${deliveryId} for user ${sub.user_id} with coupon ${code}`);
    }

    console.log('Run-sheet generation completed.');
};
