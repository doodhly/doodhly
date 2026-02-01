
import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';

export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Capture Original End (res.end)
    const originalEnd = res.end;
    // 2. Capture diff? (Complex)
    // Simplified: Log Request Context

    res.on('finish', async () => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.user) {
            // Fire and forget (don't await) or queue
            try {
                await db('data_audit_logs').insert({
                    table_name: req.path.split('/')[3] || 'unknown',
                    action: req.method,
                    actor_id: req.user.id,
                    ip_address: req.ip,
                    payload: JSON.stringify(req.body)
                });
            } catch (e) {
                console.error('Audit Log Failed', e);
            }
        }
    });

    next();
};
