import { z } from 'zod';

export const rechargeWalletSchema = z.object({
    body: z.object({
        amount: z.number().positive().min(1, 'Amount must be at least 1'),
        currency: z.string().default('INR').optional(),
    }),
});

export const paymentCallbackSchema = z.object({
    body: z.object({
        razorpay_order_id: z.string(),
        razorpay_payment_id: z.string(),
        razorpay_signature: z.string(),
    }),
});
