import { z } from 'zod';

export const createSubscriptionSchema = z.object({
    body: z.object({
        product_id: z.number().int().positive(),
        address_id: z.number().int().positive(),
        quantity: z.number().positive().default(1),
        frequency: z.enum(['DAILY', 'ALTERNATE', 'WEEKLY', 'CUSTOM']),
        custom_days: z.array(z.number().min(0).max(6)).optional(),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    }),
});

export const pauseSubscriptionSchema = z.object({
    body: z.object({
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    }),
});
