
import db from '../../../config/db';
import { AppError } from '../../../core/errors/app-error';
import { NotificationService } from '../../notification/notification.service';

export class WalletService {

    /**
     * Atomic Debit Transaction
     * @param amountPaisa Amount in PAISA (Integer)
     */
    async debitWallet(userId: string, amountPaisa: number, refId: string, trx: any) {
        // 1. Lock Wallet Row
        const wallet = await db('wallets')
            .transacting(trx)
            .where({ user_id: userId })
            .forUpdate()
            .first();

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        // CAST to Number (Knex might return string for BigInt)
        const currentBalance = Number(wallet.balance);

        if (currentBalance < amountPaisa) {
            throw new AppError('INSUFFICIENT_FUNDS', 422);
        }

        // 2. Insert Immutable Ledger Record
        const newBalance = currentBalance - amountPaisa;
        await db('wallet_ledger').transacting(trx).insert({
            wallet_id: wallet.id,
            amount_paisa: -amountPaisa, // Negative for debit (Paisa)
            direction: 'DEBIT',
            type: 'ORDER_DEDUCTION',
            reference_id: refId,
            balance_after_paisa: newBalance,
            created_at: new Date()
        });

        // 3. Update Balance Cache
        await db('wallets')
            .transacting(trx)
            .where({ id: wallet.id })
            .decrement('balance', amountPaisa);

        // Notification Check (Low Balance < 100 Rupees = 10000 Paisa)
        if (newBalance < 10000) {
            const notificationService = new NotificationService();
            await notificationService.send(userId, 'WALLET_LOW', {
                balance: (newBalance / 100).toFixed(2)
            });
        }
    }

    /**
     * Credit Wallet (e.g. Refund or Topup)
     * @param amountPaisa Amount in PAISA (Integer)
     */
    async creditWallet(userId: string, amountPaisa: number, refId: string, type: 'RECHARGE' | 'ROLLOVER_REFUND', trx: any) {
        const wallet = await db('wallets')
            .transacting(trx)
            .where({ user_id: userId })
            .forUpdate()
            .first();

        if (!wallet) throw new AppError('Wallet not found', 404);

        const newBalance = Number(wallet.balance) + amountPaisa;
        await db('wallet_ledger').transacting(trx).insert({
            wallet_id: wallet.id,
            amount_paisa: amountPaisa,
            direction: 'CREDIT',
            type: type,
            reference_id: refId,
            balance_after_paisa: newBalance,
            created_at: new Date()
        });

        await db('wallets')
            .transacting(trx)
            .where({ id: wallet.id })
            .increment('balance', amountPaisa);
    }
}
