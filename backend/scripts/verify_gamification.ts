import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import db from '../src/config/db';
import { AuthService } from '../src/modules/auth/auth.service';
import { GamificationService } from '../src/modules/gamification/gamification.service';

const authService = new AuthService();
const gamificationService = new GamificationService();

async function runVerification() {
    console.log('--- STARTING GAMIFICATION VERIFICATION ---');

    const trx = await db.transaction();
    try {
        // 1. Create Referrer (User A)
        const phoneA = `+9199999${Math.floor(Math.random() * 100000)}`;
        const userA = await authService.loginWithPhone(phoneA, '1234'); // userA creation
        console.log(`User A Created: ID ${userA.user.id}, Code: ${userA.user.referral_code}`);

        // 2. Create Referee (User B) with Referral Code
        const phoneB = `+9188888${Math.floor(Math.random() * 100000)}`;
        const userB = await authService.loginWithPhone(phoneB, '1234', userA.user.referral_code);
        console.log(`User B Created: ID ${userB.user.id}, Referred By: ${userA.user.referral_code}`);

        // Verify Referral Record Created
        const referral = await trx('referrals').where({ referee_id: userB.user.id }).first();
        if (referral && referral.status === 'PENDING') {
            console.log('✅ Referral Record Created (PENDING)');
        } else {
            console.error('❌ Referral Record Missing or Invalid');
            throw new Error('Referral creation failed');
        }

        // 3. Simulate Order Delivery for User B
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        // Create Dummy Product
        const [prodId] = await trx('products').insert({
            name: 'Test Milk',
            price_paisa: 6000,
            unit: 'Ltr'
        });

        // Create a dummy subscription & delivery
        const [subId] = await trx('subscriptions').insert({
            user_id: userB.user.id,
            product_id: prodId,
            quantity: 1,
            frequency_type: 'DAILY',
            start_date: today,
            status: 'ACTIVE',
            address_id: 1 // Dummy
        });

        const [deliveryId] = await trx('daily_deliveries').insert({
            user_id: userB.user.id,
            subscription_id: subId,
            date: dateStr,
            status: 'DELIVERED', // Simulate it being marked delivered
            debit_amount_paisa: 5000
        });

        console.log(`Simulated Delivery ID: ${deliveryId}`);

        // 4. Trigger Gamification Hooks
        console.log('Triggering Gamification Hooks...');
        await gamificationService.processDeliveryRewards(Number(userB.user.id), new Date(dateStr), trx);

        // 5. Verify Wallet Credits
        const walletA = await trx('wallets').where({ user_id: userA.user.id }).first();
        const walletB = await trx('wallets').where({ user_id: userB.user.id }).first();

        console.log(`Wallet A Balance: ${walletA.balance} (Expected 5000)`);
        console.log(`Wallet B Balance: ${walletB.balance} (Expected 5000)`);

        if (walletA.balance === 5000 && walletB.balance === 5000) {
            console.log('✅ Wallet Credits Successful');
        } else {
            console.error('❌ Wallet Credits Failed');
        }

        // 6. Verify Streak
        const userBUpdated = await trx('users').where({ id: userB.user.id }).first();
        console.log(`User B Streak: ${userBUpdated.streak_count} (Expected 1)`);

        if (userBUpdated.streak_count === 1) {
            console.log('✅ Streak Update Successful');
        } else {
            console.error('❌ Streak Update Failed');
        }

        // 7. Test Broken Streak (Simulate previous delivery 2 days ago)
        // ... (Optional, keeping it simple for now)

        // Rollback to keep DB clean
        await trx.rollback();
        console.log('--- VERIFICATION COMPLETE (Rolled back) ---');
    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
        await trx.rollback();
    } finally {
        await db.destroy();
    }
}

runVerification();
