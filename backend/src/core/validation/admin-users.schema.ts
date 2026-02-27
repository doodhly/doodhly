import { z } from 'zod';

/**
 * Validation schema for listing users with filters
 */
export const listUsersSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        role: z.enum(['CUSTOMER', 'ADMIN', 'DELIVERY_PARTNER']).optional(),
        is_active: z.enum(['true', 'false']).optional(),
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
    }),
});

/**
 * Validation schema for updating user role
 */
export const updateUserRoleSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'Invalid user ID'),
    }),
    body: z.object({
        role: z.enum(['CUSTOMER', 'ADMIN', 'DELIVERY_PARTNER'], {
            message: 'Role must be CUSTOMER, ADMIN, or DELIVERY_PARTNER'
        }),
    }),
});

/**
 * Validation schema for creating new user (admin/partner quick onboard)
 */
export const createUserSchema = z.object({
    body: z.object({
        phone: z.string()
            .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164 required)'),
        name: z.string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must not exceed 100 characters'),
        role: z.enum(['ADMIN', 'DELIVERY_PARTNER'], {
            message: 'Can only create ADMIN or DELIVERY_PARTNER users'
        }),
        default_city_id: z.number()
            .int('City ID must be an integer')
            .positive('City ID must be positive'),
    }),
});
