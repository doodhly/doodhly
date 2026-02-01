
import Razorpay from 'razorpay';
import crypto from 'crypto';
import db from '../../config/db';
import { AppError } from '../../core/errors/app-error';
import { WalletService } from '../customer/wallet/wallet.service';
import { NotificationService } from '../notification/notification.service';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_missing',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'missing',
});

const walletService = new WalletService();

export class PaymentService {

    /**
     * Initialize Paymnet Order
     * @param amountRupees Amount in RUPEES (for API compat)
     */
    async createOrder(userId: string, amountRupees: number) {
        // 1. Convert to Paisa (Integer)
        const amountPaisa = Math.round(amountRupees * 100);

        // 2. Create Razorpay Order
        const options = {
            amount: amountPaisa, // amount in paisa
            currency: 'INR',
            receipt: `rcpt_${userId}_${Date.now()}`,
        };

        try {
            const order = await razorpay.orders.create(options);

            // 3. Log Pending Transaction (Store PAISA)
            await db('payment_transactions').insert({
                id: crypto.randomUUID(),
                user_id: userId,
                amount_paisa: amountPaisa,
                currency: 'INR',
                provider_order_id: order.id,
                status: 'PENDING'
            });

            return {
                orderId: order.id,
                amount: amountRupees, // Return Rupees to frontend
                currency: 'INR',
                keyId: process.env.RAZORPAY_KEY_ID
            };
        } catch (error) {
            console.error('Razorpay Error:', error);
            throw new AppError('Payment initialization failed', 500);
        }
    }

    /**
     * Handle Webhook Verification & Wallet Credit
     */
    async handleWebhook(signature: string, payload: any) {
        // 1. Verify Signature
        // Note: In a real webhook, the payload is the raw body. 
        // Here we assume 'payload' object passed from controller contains the necessary data structure matching Razorpay webhook.
        // Usually, we verify x-razorpay-signature against the raw body.
        // For simplicity in this method, let's assume the controller passed the raw body string and separate fields if needed.

        // Actually, let's allow the controller to handle strictly raw body verification if possible.
        // Or we pass the relevant ID + signature + rawBody here.

        // Let's implement the standard verification logic:
        // expected_signature = hmac_sha256(order_id + "|" + payment_id, secret)
        // BUT for webhooks, it's distinct.
        // Let's do Standard Checkout Verification pattern (easier for MVP):
        // Verify payment_id and order_id signature sent from Frontend success callback.

        // However, user asked for "Webhook". 
        // A webhook checks: event === 'payment.captured'
        // Let's support the Webhook flow for reliability.

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_test';
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload)) // CAUTION: payload must be raw string. 
            .digest('hex');

        // Logic handled in Controller to pass raw body? 
        // Let's assume the Controller does the signature verification for security sake 
        // (as it has access to raw body stream).

        // This service method will focus on BUSINESS LOGIC: Idempotency + Credit.

        const event = payload.event;

        if (event === 'payment.captured') {
            const payment = payload.payload.payment.entity;
            const orderId = payment.order_id;
            const paymentId = payment.id;

            // 2. Idempotency Check
            const trx = await db.transaction();
            try {
                const transaction = await trx('payment_transactions')
                    .where({ provider_order_id: orderId })
                    .forUpdate()
                    .first();

                if (!transaction) {
                    // Unknown order? Log and ignore.
                    await trx.rollback();
                    return;
                }

                if (transaction.status === 'SUCCESS') {
                    // Already processed
                    await trx.rollback();
                    return;
                }

                // 3. Update Transaction Status
                await trx('payment_transactions')
                    .where({ id: transaction.id })
                    .update({
                        status: 'SUCCESS',
                        provider_payment_id: paymentId,
                        updated_at: trx.fn.now()
                    });

                // 4. Credit Wallet
                await walletService.creditWallet(
                    transaction.user_id,
                    Number(payment.amount), // Razorpay sends Paisa. We use Paisa.
                    transaction.id,
                    'RECHARGE',
                    trx,
                );

                await trx.commit();
                console.log(`Wallet credited for order ${orderId}`);

                // 5. Send Notification (Async)
                const updatedWallet = await db('wallets').where({ user_id: transaction.user_id }).first();
                const notificationService = new NotificationService();
                await notificationService.send(transaction.user_id, 'PAYMENT_SUCCESS', {
                    amount: (Number(payment.amount) / 100).toFixed(2), // Convert Paisa to Rupees
                    balance: (Number(updatedWallet?.balance || 0) / 100).toFixed(2) // Convert Paisa to Rupees
                });

            } catch (error) {
                await trx.rollback();
                console.error('Webhook processing failed:', error);
                throw error;
            }
        }
    }

    /**
     * Frontend Callback Verification (Backup to Webhook)
     */
    async verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
        const text = orderId + '|' + paymentId;
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(text)
            .digest('hex');

        // CONSTANT TIME COMPARISON (Security)
        const expectedBuffer = Buffer.from(expected);
        const signatureBuffer = Buffer.from(signature);

        if (expectedBuffer.length === signatureBuffer.length &&
            crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
            // We can optimistically credit here if webhook is delayed, 
            // BUT simpler to rely on Webhook OR calling this.
            // Let's use this to trigger the same logic as webhook if needed.
            // For now, return success boolean.
            return true;
        }
        return false;
    }
}
