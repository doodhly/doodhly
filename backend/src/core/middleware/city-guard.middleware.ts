
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';

// extend Request to include user and city
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
                city_id: string;
            };
        }
    }
}

export const cityGuard = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.city_id) {
        return next(new AppError('No City Context Found', 403));
    }
    // In a real query builder, we would inject this into knex context 
    // For now, we rely on controllers using req.user.city_id
    next();
};
