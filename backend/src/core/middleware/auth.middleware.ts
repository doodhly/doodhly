
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/app-error';

import { secrets } from '../../config/secrets';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    let token = '';

    // 1. Try Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    // 2. Try Cookie if header missing (or as preferred source in prod)
    else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token || token === 'undefined' || token === 'null') {
        return next(new AppError('Authentication required', 401));
    }

    try {
        const payload = jwt.verify(token, secrets.JWT_SECRET, {
            algorithms: ['HS256']
        });
        req.user = payload as any;
        next();
    } catch (err) {
        next(new AppError('Invalid or expired token', 401));
    }
};

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('Permission Denied: Insufficient Role', 403));
        }
        next();
    };
};
