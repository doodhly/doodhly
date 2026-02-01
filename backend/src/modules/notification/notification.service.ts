import db from '../../config/db';
import { SmsService } from './sms.service';

const smsService = new SmsService();

export type NotificationType =
    | 'PAYMENT_SUCCESS'
    | 'SUBSCRIPTION_CREATED'
    | 'SUBSCRIPTION_PAUSED'
    | 'DELIVERY_MISSED'
    | 'WALLET_LOW';

export class NotificationService {
    /**
     * Send Notification
     * Centralized handler that respects user preferences and channels
     */
    async send(userId: string, type: NotificationType, data: any) {
        try {
            // 1. Fetch User
            const user = await db('users').where({ id: userId }).first();
            if (!user) return;

            // 2. Construct Message based on Type
            const message = this.constructMessage(type, data);

            // 3. Dispatch SMS (Always Transactional)
            await smsService.sendMessage(user.phone, message, 'sms');

            // 4. Dispatch WhatsApp if Opted-in
            if (user.is_whatsapp_optin) {
                await smsService.sendMessage(user.phone, message, 'whatsapp');
            }

            console.log(`[NOTIFICATION] Propagated ${type} to ${user.phone}`);

        } catch (error) {
            console.error('Notification System Failure:', error);
            // Non-blocking: Do not throw
        }
    }

    private constructMessage(type: NotificationType, data: any): string {
        switch (type) {
            case 'PAYMENT_SUCCESS':
                return `Payment Success: Rs.${data.amount} added to your Doodhly wallet. Current Balance: Rs.${data.balance}.`;

            case 'SUBSCRIPTION_CREATED':
                return `Active: Your subscription for ${data.productName} (${data.quantity}L) is now active. Delivery starts ${data.startDate}.`;

            case 'SUBSCRIPTION_PAUSED':
                return `Paused: Your subscription for ${data.productName} is paused until ${data.resumeDate || 'further notice'}.`;

            case 'DELIVERY_MISSED':
                return `Delivery Alert: We missed your delivery today due to ${data.reason}. Rs.${data.amount} has been refunded.`;

            case 'WALLET_LOW':
                return `Low Balance Alert: Your Doodhly wallet has only Rs.${data.balance}. Please recharge by 10 PM to ensure tomorrow's delivery.`;

            default:
                return 'Update from Doodhly.';
        }
    }
}
