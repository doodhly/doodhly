
import { Router, Request, Response, NextFunction } from 'express';
import db from '../../../config/db';
import { requireAuth } from '../../../core/middleware/auth.middleware';
import { AppError } from '../../../core/errors/app-error';

const router = Router();

// Get Wallet Balance
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.user guaranteed by requireAuth
        const wallet = await db('wallets').where({ user_id: req.user!.id }).first();
        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }
        res.status(200).json({
            balance: wallet.balance / 100,
            currency: 'INR'
        });
    } catch (err) {
        next(err);
    }
});

// Get Ledger History
router.get('/ledger', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wallet = await db('wallets').where({ user_id: req.user!.id }).first();
        if (!wallet) throw new AppError('Wallet not found', 404);

        const ledger = await db('wallet_ledger')
            .where({ wallet_id: wallet.id })
            .select('*', db.raw('amount_paisa / 100 as amount'))
            .orderBy('created_at', 'desc')
            .limit(50);

        res.status(200).json(ledger);
    } catch (err) {
        next(err);
    }
});

export const walletRouter = router;
