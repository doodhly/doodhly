import { SubscriptionService } from '../subscription.service';
import db from '@/config/db';
import { createTestUser, createTestProduct } from '@/__tests__/setup';

describe('SubscriptionService', () => {
    let subscriptionService: SubscriptionService;

    beforeEach(() => {
        subscriptionService = new SubscriptionService();
    });

    describe('createSubscription', () => {
        it('should create a new subscription successfully', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            const subscriptionData = {
                userId: user.id,
                productId: product.id,
                quantity: 2,
                startDate: '2026-02-20',
                schedule: 'DAILY' as const,
                addressId: 1,
            };

            const subscription = await subscriptionService.createSubscription(subscriptionData);

            expect(subscription).toBeDefined();
            expect(subscription.user_id).toBe(user.id);
            expect(subscription.product_id).toBe(product.id);
            expect(subscription.quantity).toBe(2);
            expect(subscription.schedule).toBe('DAILY');
            expect(subscription.is_active).toBe(true);

            // Verify in database
            const dbSub = await db('subscriptions')
                .where({ id: subscription.id })
                .first();

            expect(dbSub).toBeDefined();
            expect(dbSub.user_id).toBe(user.id);
        });

        it('should create subscription with custom schedule', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            const subscriptionData = {
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'CUSTOM' as const,
                customDays: [1, 3, 5], // Mon, Wed, Fri
                addressId: 1,
            };

            const subscription = await subscriptionService.createSubscription(subscriptionData);

            expect(subscription.schedule).toBe('CUSTOM');
            expect(subscription.custom_days).toEqual([1, 3, 5]);
        });

        it('should throw error for invalid product', async () => {
            const user = await createTestUser();

            const subscriptionData = {
                userId: user.id,
                productId: 99999, // Non-existent
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY' as const,
                addressId: 1,
            };

            await expect(
                subscriptionService.createSubscription(subscriptionData)
            ).rejects.toThrow();
        });

        it('should create subscription with end date', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            const subscriptionData = {
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                endDate: '2026-03-20',
                schedule: 'DAILY' as const,
                addressId: 1,
            };

            const subscription = await subscriptionService.createSubscription(subscriptionData);

            expect(subscription.end_date).toBeDefined();
            expect(new Date(subscription.end_date!).toISOString().split('T')[0]).toBe('2026-03-20');
        });
    });

    describe('pauseSubscription', () => {
        it('should pause an active subscription', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            // Create subscription
            const subscription = await subscriptionService.createSubscription({
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY',
                addressId: 1,
            });

            // Pause it
            await subscriptionService.pauseSubscription(
                subscription.id,
                user.id.toString()
            );

            // Verify paused
            const pausedSub = await db('subscriptions')
                .where({ id: subscription.id })
                .first();

            expect(pausedSub.is_active).toBe(false);
            expect(pausedSub.paused_at).toBeDefined();
        });

        it('should throw error when pausing non-existent subscription', async () => {
            await expect(
                subscriptionService.pauseSubscription(99999, '1')
            ).rejects.toThrow('Subscription not found');
        });

        it('should throw error when user tries to pause another users subscription', async () => {
            const user1 = await createTestUser();
            const user2 = await createTestUser();
            const product = await createTestProduct();

            const subscription = await subscriptionService.createSubscription({
                userId: user1.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY',
                addressId: 1,
            });

            await expect(
                subscriptionService.pauseSubscription(
                    subscription.id,
                    user2.id.toString()
                )
            ).rejects.toThrow();
        });
    });

    describe('resumeSubscription', () => {
        it('should resume a paused subscription', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            // Create and pause subscription
            const subscription = await subscriptionService.createSubscription({
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY',
                addressId: 1,
            });

            await subscriptionService.pauseSubscription(
                subscription.id,
                user.id.toString()
            );

            // Resume it
            await subscriptionService.resumeSubscription(
                subscription.id,
                user.id.toString()
            );

            // Verify resumed
            const resumedSub = await db('subscriptions')
                .where({ id: subscription.id })
                .first();

            expect(resumedSub.is_active).toBe(true);
            expect(resumedSub.resumed_at).toBeDefined();
        });

        it('should throw error when resuming already active subscription', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            const subscription = await subscriptionService.createSubscription({
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY',
                addressId: 1,
            });

            await expect(
                subscriptionService.resumeSubscription(
                    subscription.id,
                    user.id.toString()
                )
            ).rejects.toThrow();
        });
    });

    describe('updateQuantity', () => {
        it('should update subscription quantity', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            const subscription = await subscriptionService.createSubscription({
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY',
                addressId: 1,
            });

            await subscriptionService.updateQuantity(
                subscription.id,
                user.id.toString(),
                3
            );

            const updated = await db('subscriptions')
                .where({ id: subscription.id })
                .first();

            expect(updated.quantity).toBe(3);
        });

        it('should throw error for invalid quantity', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            const subscription = await subscriptionService.createSubscription({
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY',
                addressId: 1,
            });

            await expect(
                subscriptionService.updateQuantity(
                    subscription.id,
                    user.id.toString(),
                    0 // Invalid
                )
            ).rejects.toThrow();
        });
    });

    describe('cancelSubscription', () => {
        it('should cancel an active subscription', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            const subscription = await subscriptionService.createSubscription({
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY',
                addressId: 1,
            });

            await subscriptionService.cancelSubscription(
                subscription.id,
                user.id.toString()
            );

            const cancelled = await db('subscriptions')
                .where({ id: subscription.id })
                .first();

            expect(cancelled.is_active).toBe(false);
            expect(cancelled.cancelled_at).toBeDefined();
        });
    });

    describe('getActiveSubscriptions', () => {
        it('should return only active subscriptions for user', async () => {
            const user = await createTestUser();
            const product = await createTestProduct();

            // Create 2 active, 1 cancelled
            const sub1 = await subscriptionService.createSubscription({
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY',
                addressId: 1,
            });

            const sub2 = await subscriptionService.createSubscription({
                userId: user.id,
                productId: product.id,
                quantity: 2,
                startDate: '2026-02-20',
                schedule: 'ALTERNATE_DAYS',
                addressId: 1,
            });

            const sub3 = await subscriptionService.createSubscription({
                userId: user.id,
                productId: product.id,
                quantity: 1,
                startDate: '2026-02-20',
                schedule: 'DAILY',
                addressId: 1,
            });

            await subscriptionService.cancelSubscription(sub3.id, user.id.toString());

            const activeSubs = await subscriptionService.getActiveSubscriptions(user.id.toString());

            expect(activeSubs).toHaveLength(2);
            expect(activeSubs.map(s => s.id)).toContain(sub1.id);
            expect(activeSubs.map(s => s.id)).toContain(sub2.id);
            expect(activeSubs.map(s => s.id)).not.toContain(sub3.id);
        });
    });
});
