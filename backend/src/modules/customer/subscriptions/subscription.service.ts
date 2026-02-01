

import db from '../../../config/db';
import { AppError } from '../../../core/errors/app-error';
import { NotificationService } from '../../notification/notification.service';

import { TimeUtils } from '../../../core/utils/time.utils';

export class SubscriptionService {

    async createSubscription(userId: string, cityId: string, data: any) {
        // Basic validation should be done by Controller/Joi

        // Start Date Cutoff Check
        if (!TimeUtils.isModificationAllowed(data.start_date)) {
            throw new AppError('Cannot start subscription for this date (8 PM Cutoff)', 422);
        }

        // Insert Logic
        const [subId] = await db('subscriptions').insert({
            user_id: userId,
            city_id: cityId,
            product_id: data.product_id,
            quantity: data.quantity,
            frequency_type: data.frequency, // DAILY, ALTERNATE
            start_date: data.start_date,
            status: 'ACTIVE',
            address_id: data.address_id
        });

        // Notification
        const product = await db('products').where({ id: data.product_id }).first();
        const notificationService = new NotificationService();
        await notificationService.send(userId, 'SUBSCRIPTION_CREATED', {
            productName: product?.name || 'Milk Product',
            quantity: data.quantity,
            startDate: data.start_date
        });

        return { subscription_id: subId, status: 'ACTIVE' };
    }

    async getUserSubscriptions(userId: string) {
        const subs = await db('subscriptions as s')
            .join('products as p', 's.product_id', 'p.id')
            .where({ 's.user_id': userId })
            .select(
                's.id',
                'p.name as productName',
                's.quantity',
                's.frequency_type as frequency',
                's.status',
                's.start_date as nextDeliveryDate',
                db.raw('p.price_paisa / 100 as pricePerUnit')
            )
            .orderBy('s.created_at', 'desc');

        return subs;
    }

    async pauseSubscription(userId: string, subId: string, startDate: string, endDate?: string) {
        // ... (validation logic) ...
        // 1. Validate Cutoff
        if (!TimeUtils.isModificationAllowed(startDate)) {
            throw new AppError('Cannot pause for this date (8 PM Cutoff)', 422);
        }

        // 2. Fetch Subscription (Security Check)
        const sub = await db('subscriptions').where({ id: subId, user_id: userId }).first();
        if (!sub) throw new AppError('Subscription not found', 404);

        // 3. HARDENING: Check if Delivery already exists for this date
        const existingDelivery = await db('daily_deliveries')
            .where({ subscription_id: subId, date: startDate })
            .first();

        if (existingDelivery) {
            throw new AppError('Cannot pause: Delivery already generated for this date.', 422);
        }

        // 4. Mark Paused
        if (!endDate) {
            await db('subscriptions').where({ id: subId }).update({ status: 'PAUSED' });
        } else {
            // Insert into pauses table (Schema defined it)
            await db('subscription_pauses').insert({
                subscription_id: subId,
                start_date: startDate,
                end_date: endDate
            });
        }

        // Notification
        const product = await db('products').where({ id: sub.product_id }).first();
        const notificationService = new NotificationService();
        await notificationService.send(userId, 'SUBSCRIPTION_PAUSED', {
            productName: product?.name || 'Subscription',
            resumeDate: endDate
        });

        return { message: 'Subscription paused' };
    }

    async resumeSubscription(userId: string, subId: string) {
        await db('subscriptions')
            .where({ id: subId, user_id: userId })
            .update({ status: 'ACTIVE' });

        // Notification
        const sub = await db('subscriptions').where({ id: subId }).first();
        const product = await db('products').where({ id: sub.product_id }).first();
        const notificationService = new NotificationService();
        await notificationService.send(userId, 'SUBSCRIPTION_CREATED', {
            productName: product?.name || 'Subscription',
            quantity: sub.quantity,
            startDate: 'Tomorrow'
        });
    }

    async getActiveSubsForDate(cityId: string, date: string) {
        // ... existing logic ...
        return db('subscriptions')
            .where({ city_id: cityId, status: 'ACTIVE' })
            .andWhere('start_date', '<=', date)
            .whereNotExists((builder) => {
                builder.select('id')
                    .from('subscription_pauses')
                    .whereRaw('subscription_pauses.subscription_id = subscriptions.id')
                    .andWhere('start_date', '<=', date)
                    .andWhere('end_date', '>=', date);
            });
    }
}
