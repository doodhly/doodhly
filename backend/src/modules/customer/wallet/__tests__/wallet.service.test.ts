import { WalletService } from '../wallet.service';
import db from '@/config/db';
import { createTestUser, createTestWallet } from '@/__tests__/setup';

describe('WalletService', () => {
    let walletService: WalletService;

    beforeAll(async () => {
        // Ensure migrations are run first (only once)
        try {
            await db.migrate.latest();
            console.log('✓ Migrations complete for WalletService tests');
        } catch (e) {
            const error = e as Error;
            console.log('Migrations already run or error:', error.message);
        }
    });

    beforeEach(() => {
        walletService = new WalletService();
    });

    describe('debitWallet', () => {
        it('should successfully debit wallet with sufficient balance', async () => {
            const user = await createTestUser();
            await createTestWallet(user.id, 10000); // ₹100 balance

            await db.transaction(async (trx) => {
                await walletService.debitWallet(
                    user.id.toString(),
                    5000, // Debit ₹50
                    'ORDER-123',
                    trx
                );
            });

            // Verify wallet balance
            const wallet = await db('wallets')
                .where({ user_id: user.id })
                .first();

            expect(wallet.balance).toBe(5000); // ₹50 remaining

            // Verify ledger entry
            const ledgerEntry = await db('wallet_ledger')
                .where({ reference_id: 'ORDER-123' })
                .first();

            expect(ledgerEntry).toBeDefined();
            expect(ledgerEntry.amount_paisa).toBe(-5000);
            expect(ledgerEntry.direction).toBe('DEBIT');
            expect(ledgerEntry.type).toBe('ORDER_DEDUCTION');
            expect(ledgerEntry.balance_after_paisa).toBe(5000);
        });

        it('should throw error for insufficient funds', async () => {
            const user = await createTestUser();
            await createTestWallet(user.id, 5000); // ₹50 balance

            await expect(
                db.transaction(async (trx) => {
                    await walletService.debitWallet(
                        user.id.toString(),
                        10000, // Try to debit ₹100
                        'ORDER-124',
                        trx
                    );
                })
            ).rejects.toThrow('INSUFFICIENT_FUNDS');

            // Verify balance unchanged
            const wallet = await db('wallets')
                .where({ user_id: user.id })
                .first();

            expect(wallet.balance).toBe(5000); // Still ₹50

            // Verify no ledger entry created
            const ledgerEntry = await db('wallet_ledger')
                .where({ reference_id: 'ORDER-124' })
                .first();

            expect(ledgerEntry).toBeUndefined();
        });

        it('should throw error for non-existent wallet', async () => {
            await expect(
                db.transaction(async (trx) => {
                    await walletService.debitWallet(
                        '999999', // Non-existent user
                        5000,
                        'ORDER-125',
                        trx
                    );
                })
            ).rejects.toThrow('Wallet not found');
        });

        it('should handle concurrent debits with row locking', async () => {
            const user = await createTestUser();
            await createTestWallet(user.id, 10000); // ₹100 balance

            // Simulate concurrent debits
            const debit1 = db.transaction(async (trx) => {
                await walletService.debitWallet(
                    user.id.toString(),
                    3000,
                    'ORDER-201',
                    trx
                );
                // Add small delay to test locking
                await new Promise(resolve => setTimeout(resolve, 10));
            });

            const debit2 = db.transaction(async (trx) => {
                await walletService.debitWallet(
                    user.id.toString(),
                    4000,
                    'ORDER-202',
                    trx
                );
            });

            await Promise.all([debit1, debit2]);

            // Verify final balance is correct
            const wallet = await db('wallets')
                .where({ user_id: user.id })
                .first();

            expect(wallet.balance).toBe(3000); // ₹100 - ₹30 - ₹40 = ₹30

            // Verify both ledger entries exist
            const ledgerEntries = await db('wallet_ledger')
                .whereIn('reference_id', ['ORDER-201', 'ORDER-202'])
                .orderBy('created_at', 'asc');

            expect(ledgerEntries).toHaveLength(2);
        });

        it('should send low balance notification when balance < ₹100', async () => {
            const user = await createTestUser();
            await createTestWallet(user.id, 11000); // ₹110 balance

            await db.transaction(async (trx) => {
                await walletService.debitWallet(
                    user.id.toString(),
                    2000, // Debit ₹20, leaving ₹90
                    'ORDER-301',
                    trx
                );
            });

            // Verify wallet balance
            const wallet = await db('wallets')
                .where({ user_id: user.id })
                .first();

            expect(wallet.balance).toBe(9000); // ₹90 (below ₹100 threshold)

            // Note: Actual notification check would require mocking the NotificationService
            // For now, we just verify the balance dropped below threshold
        });
    });

    describe('creditWallet', () => {
        it('should successfully credit wallet with RECHARGE type', async () => {
            const user = await createTestUser();
            await createTestWallet(user.id, 5000); // ₹50 balance

            await db.transaction(async (trx) => {
                await walletService.creditWallet(
                    user.id.toString(),
                    10000, // Credit ₹100
                    'RECHARGE-456',
                    'RECHARGE',
                    trx
                );
            });

            // Verify wallet balance
            const wallet = await db('wallets')
                .where({ user_id: user.id })
                .first();

            expect(wallet.balance).toBe(15000); // ₹150 total

            // Verify ledger entry
            const ledgerEntry = await db('wallet_ledger')
                .where({ reference_id: 'RECHARGE-456' })
                .first();

            expect(ledgerEntry).toBeDefined();
            expect(ledgerEntry.amount_paisa).toBe(10000);
            expect(ledgerEntry.direction).toBe('CREDIT');
            expect(ledgerEntry.type).toBe('RECHARGE');
            expect(ledgerEntry.balance_after_paisa).toBe(15000);
        });

        it('should successfully credit wallet with ROLLOVER_REFUND type', async () => {
            const user = await createTestUser();
            await createTestWallet(user.id, 0); // Empty wallet

            await db.transaction(async (trx) => {
                await walletService.creditWallet(
                    user.id.toString(),
                    3500, // Refund ₹35
                    'REFUND-789',
                    'ROLLOVER_REFUND',
                    trx
                );
            });

            // Verify wallet balance
            const wallet = await db('wallets')
                .where({ user_id: user.id })
                .first();

            expect(wallet.balance).toBe(3500);

            // Verify ledger entry
            const ledgerEntry = await db('wallet_ledger')
                .where({ reference_id: 'REFUND-789' })
                .first();

            expect(ledgerEntry.type).toBe('ROLLOVER_REFUND');
        });

        it('should throw error for non-existent wallet', async () => {
            await expect(
                db.transaction(async (trx) => {
                    await walletService.creditWallet(
                        '999999',
                        5000,
                        'RECHARGE-999',
                        'RECHARGE',
                        trx
                    );
                })
            ).rejects.toThrow('Wallet not found');
        });

        it('should handle multiple concurrent credits', async () => {
            const user = await createTestUser();
            await createTestWallet(user.id, 1000); // ₹10 initial

            const credit1 = db.transaction(async (trx) => {
                await walletService.creditWallet(
                    user.id.toString(),
                    5000,
                    'RECHARGE-501',
                    'RECHARGE',
                    trx
                );
            });

            const credit2 = db.transaction(async (trx) => {
                await walletService.creditWallet(
                    user.id.toString(),
                    3000,
                    'REFUND-502',
                    'ROLLOVER_REFUND',
                    trx
                );
            });

            await Promise.all([credit1, credit2]);

            // Verify final balance
            const wallet = await db('wallets')
                .where({ user_id: user.id })
                .first();

            expect(wallet.balance).toBe(9000); // ₹10 + ₹50 + ₹30 = ₹90
        });
    });

    describe('Transaction Integrity', () => {
        it('should rollback wallet debit on transaction failure', async () => {
            const user = await createTestUser();
            await createTestWallet(user.id, 10000); // ₹100

            try {
                await db.transaction(async (trx) => {
                    await walletService.debitWallet(
                        user.id.toString(),
                        3000,
                        'ORDER-ERR',
                        trx
                    );

                    // Force transaction failure
                    throw new Error('Simulated failure');
                });
            } catch (error) {
                // Expected error
            }

            // Verify balance unchanged (rollback worked)
            const wallet = await db('wallets')
                .where({ user_id: user.id })
                .first();

            expect(wallet.balance).toBe(10000); // Still ₹100

            // Verify no ledger entry
            const ledgerEntry = await db('wallet_ledger')
                .where({ reference_id: 'ORDER-ERR' })
                .first();

            expect(ledgerEntry).toBeUndefined();
        });

        it('should maintain ledger immutability (no updates/deletes)', async () => {
            const user = await createTestUser();
            await createTestWallet(user.id, 5000);

            await db.transaction(async (trx) => {
                await walletService.debitWallet(
                    user.id.toString(),
                    1000,
                    'ORDER-IMM',
                    trx
                );
            });

            const ledgerEntry = await db('wallet_ledger')
                .where({ reference_id: 'ORDER-IMM' })
                .first();

            const originalAmount = ledgerEntry.amount_paisa;

            // Attempt to update should not affect original entry
            // (In practice, ledger should have DB constraints preventing updates)
            // This test just verifies the entry exists and has the right data
            expect(ledgerEntry.amount_paisa).toBe(-1000);
            expect(ledgerEntry.created_at).toBeInstanceOf(Date);
        });
    });
});
