import db from '@/config/db';
import { AppError } from '@/core/errors/app-error';

interface CreateSubscriptionData {
    userId: number;
    productId: number;
    quantity: number;
    startDate: string;
    endDate?: string;
    schedule: 'DAILY' | 'ALTERNATE_DAYS' | 'CUSTOM';
    customDays?: number[];
    addressId: number;
}

export class SubscriptionService {
    /**
     * Create a new subscription
     */
    async createSubscription(data: CreateSubscriptionData) {
        // Verify product exists
        const product = await db('products')
            .where({ id: data.productId })
            .first();

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Create subscription
        const [subscriptionId] = await db('subscriptions').insert({
            user_id: data.userId,
            product_id: data.productId,
            quantity: data.quantity,
            start_date: data.startDate,
            end_date: data.endDate || null,
            schedule: data.schedule,
            custom_days: data.customDays ? JSON.stringify(data.customDays) : null,
            address_id: data.addressId,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return db('subscriptions')
            .where({ id: subscriptionId })
            .first();
    }

    /**
     * Pause an active subscription
     */
    async pauseSubscription(subscriptionId: number, userId: string) {
        const subscription = await db('subscriptions')
            .where({ id: subscriptionId, user_id: parseInt(userId) })
            .first();

        if (!subscription) {
            throw new AppError('Subscription not found', 404);
        }

        if (!subscription.is_active) {
            throw new AppError('Subscription is already paused', 400);
        }

        await db('subscriptions')
            .where({ id: subscriptionId })
            .update({
                is_active: false,
                paused_at: new Date(),
                updated_at: new Date(),
            });

        return true;
    }

    /**
     * Resume a paused subscription
     */
    async resumeSubscription(subscriptionId: number, userId: string) {
        const subscription = await db('subscriptions')
            .where({ id: subscriptionId, user_id: parseInt(userId) })
            .first();

        if (!subscription) {
            throw new AppError('Subscription not found', 404);
        }

        if (subscription.is_active) {
            throw new AppError('Subscription is already active', 400);
        }

        await db('subscriptions')
            .where({ id: subscriptionId })
            .update({
                is_active: true,
                resumed_at: new Date(),
                updated_at: new Date(),
            });

        return true;
    }

    /**
     * Update subscription quantity
     */
    async updateQuantity(subscriptionId: number, userId: string, quantity: number) {
        if (quantity < 1) {
            throw new AppError('Quantity must be at least 1', 400);
        }

        const subscription = await db('subscriptions')
            .where({ id: subscriptionId, user_id: parseInt(userId) })
            .first();

        if (!subscription) {
            throw new AppError('Subscription not found', 404);
        }

        await db('subscriptions')
            .where({ id: subscriptionId })
            .update({
                quantity,
                updated_at: new Date(),
            });

        return true;
    }

    /**
     * Cancel a subscription
     */
    async cancelSubscription(subscriptionId: number, userId: string) {
        const subscription = await db('subscriptions')
            .where({ id: subscriptionId, user_id: parseInt(userId) })
            .first();

        if (!subscription) {
            throw new AppError('Subscription not found', 404);
        }

        await db('subscriptions')
            .where({ id: subscriptionId })
            .update({
                is_active: false,
                cancelled_at: new Date(),
                updated_at: new Date(),
            });

        return true;
    }

    /**
     * Get active subscriptions for a user
     */
    async getActiveSubscriptions(userId: string) {
        return db('subscriptions')
            .where({ user_id: parseInt(userId), is_active: true })
            .whereNull('cancelled_at')
            .select('*');
    }
}
