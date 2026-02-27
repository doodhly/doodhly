
import db from '../../../config/db';
import { AppError } from '../../../core/errors/app-error';

import { WalletService } from '../../customer/wallet/wallet.service';
import { DeliveryStateMachine } from '../delivery.state';

const walletService = new WalletService();

export class DeliveryVerificationService {

    async verifyCoupon(code: string, driverId: string) {
        return db.transaction(async (trx) => {
            // 1. Fetch Coupon with Lock
            const coupon = await db('coupons')
                .transacting(trx)
                .where({ code })
                .forUpdate()
                .first();

            if (!coupon) throw new AppError('INVALID_CODE', 400);
            if (coupon.status === 'SCANNED') return { status: 'ALREADY_SCANNED' };
            if (coupon.status === 'VOID') throw new AppError('COUPON_VOID', 422);

            // 2. Fetch Delivery
            const delivery = await db('daily_deliveries')
                .transacting(trx)
                .where({ id: coupon.linked_delivery_id })
                .first();

            if (!delivery) throw new AppError('Orphaned Coupon', 500);

            // 3. State Machine Check
            DeliveryStateMachine.validateTransition(delivery.status, 'DELIVERED');

            // 4. Mark Used
            await db('coupons')
                .transacting(trx)
                .where({ id: coupon.id })
                .update({ status: 'SCANNED', scanned_at: new Date(), scanner_id: driverId });

            // 5. Update Delivery Status
            await db('daily_deliveries')
                .transacting(trx)
                .where({ id: delivery.id })
                .update({ status: 'DELIVERED', proof_type: 'COUPON' });

            // 6. Gamification Hooks
            const GamificationService = require('../../gamification/gamification.service').GamificationService;
            const gamificationService = new GamificationService();
            await gamificationService.processDeliveryRewards(delivery.user_id, delivery.date, trx);

            return { status: 'VERIFIED', delivery_id: delivery.id };
        });
    }

    async reportIssue(dailyDeliveryId: string, reason: string, driverId: string, driverCityId: number) {
        return db.transaction(async (trx) => {
            // 1. Fetch Delivery
            const delivery = await db('daily_deliveries')
                .transacting(trx)
                .where({ id: dailyDeliveryId })
                .forUpdate() // Lock
                .first();

            if (!delivery) throw new AppError('Delivery not found', 404);

            // SECURITY: City Isolation
            // Ensure delivery belongs to the driver's city
            if (delivery.city_id && delivery.city_id !== Number(driverCityId)) {
                throw new AppError('Access Denied: Delivery belongs to another city', 403);
            }

            // SECURITY: Ownership
            // If strictly assigned, only that driver can report
            if (delivery.assigned_staff_id && delivery.assigned_staff_id !== Number(driverId)) {
                throw new AppError('Access Denied: Not assigned to this delivery', 403);
            }

            // 2. State Machine Check
            DeliveryStateMachine.validateTransition(delivery.status, 'MISSED');

            // 3. IDEMPOTENCY GUARD: Check for existing Rollback Ledger
            const existingRefund = await db('wallet_ledger')
                .transacting(trx)
                .where({
                    reference_id: `REFUND-${delivery.id}`,
                    type: 'ROLLOVER_REFUND'
                })
                .first();

            if (existingRefund) {
                console.warn(`Duplicate Refund blocked for delivery ${delivery.id}`);
                return { status: 'ALREADY_REFUNDED' };
            }

            // 4. Update Status
            await db('daily_deliveries')
                .transacting(trx)
                .where({ id: delivery.id })
                .update({
                    status: 'MISSED',
                    notes: reason,
                    assigned_staff_id: driverId // Audit who failed it
                });

            // 5. Refund Wallet (Credit)
            await walletService.creditWallet(
                delivery.user_id,
                delivery.debit_amount_paisa,
                `REFUND-${delivery.id}`,
                'ROLLOVER_REFUND',
                trx
            );

            // 6. Send Notification (Async)
            const notificationService = new (require('../../notification/notification.service').NotificationService)();
            await notificationService.send(delivery.user_id, 'DELIVERY_MISSED', {
                reason: reason,
                amount: (delivery.debit_amount_paisa / 100).toFixed(2)
            });

            return { status: 'REPORTED_AND_REFUNDED' };
        });
    }
}
