import { z } from 'zod';

export const requestOtpSchema = z.object({
    body: z.object({
        phone: z.string()
            .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164 recommended)'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        phone: z.string()
            .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
        otp: z.string()
            .length(4, 'OTP must be 4 digits') // Adjust based on your actual OTP length
            .regex(/^\d+$/, 'OTP must be numeric'),
        referralCode: z.string().length(6, 'Referral code must be 6 characters').optional(),
    }),
});

export const onboardingSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        whatsapp_number: z.string().optional(),
        household_size: z.number().int().positive().optional(),
        daily_milk_liters: z.number().positive().optional(),
        address: z.object({
            street: z.string().min(5),
            city: z.string().min(2),
            zip: z.string().regex(/^\d{5,6}$/),
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
        }),
    }),
});
