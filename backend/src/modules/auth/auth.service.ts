
import db from '../../config/db';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../../core/errors/app-error';
import { SmsService } from '../notification/sms.service';

const smsService = new SmsService();

export class AuthService {

    private hashOtp(otp: string): string {
        return crypto.createHash('sha256').update(otp).digest('hex');
    }

    async requestOtp(phone: string) {
        // 1. Generate 6 digit crypto-secure code
        const code = crypto.randomInt(100000, 999999).toString();
        const otpHash = this.hashOtp(code);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // 2. Store Hash in DB (Invalidate previous codes for this phone)
        await db('verification_codes').where({ phone }).del(); // Optional: Clean up old codes

        await db('verification_codes').insert({
            phone,
            otp_hash: otpHash,
            expires_at: expiresAt,
            attempts: 0,
            is_verified: false
        });

        // 3. Send PLAIN code via SMS (Skip in Dev)
        if (process.env.NODE_ENV !== 'development') {
            await smsService.sendOtp(phone, code);
        } else {
            console.log(`[DEV] OTP for ${phone}: ${code} (Auto-login enabled)`);
        }

        return { message: 'OTP sent successfully' };
    }

    async loginWithPhone(phone: string, otp: string) {
        // Backdoor for development (Skip detailed checks if strictly dev and using backdoor OTP)
        if (otp === '1234' && process.env.NODE_ENV === 'development') {
            console.log(`[BACKDOOR] Bypassing OTP check for phone: ${phone}`);
        } else {
            // 1. Find Record
            const record = await db('verification_codes')
                .where({ phone })
                .where('expires_at', '>', new Date())
                .first();

            if (!record) {
                throw new AppError('OTP expired or not found', 400);
            }

            // 2. Check Attempts
            if (record.attempts >= 5) {
                // Invalidate record for security
                await db('verification_codes').where('id', record.id).del();
                throw new AppError('Too many attempts. Please request a new OTP.', 429);
            }

            // 3. Verify Hash
            const inputHash = this.hashOtp(otp);
            if (record.otp_hash !== inputHash) {
                // Increment attempts
                await db('verification_codes')
                    .where('id', record.id)
                    .increment('attempts', 1);

                throw new AppError('Invalid OTP', 400);
            }

            // 4. Cleanup (Prevent Replay)
            await db('verification_codes').where('id', record.id).del();
        }

        // 5. Find/Create User
        const user = await db.transaction(async (trx) => {
            let existingUser = await trx('users').where({ phone_hash: phone }).first();

            if (!existingUser) {
                const [newUserId] = await trx('users').insert({
                    phone_hash: phone,
                    role: 'CUSTOMER'
                });

                // Init Wallet
                await trx('wallets').insert({
                    user_id: newUserId,
                    balance: 0
                });

                existingUser = { id: newUserId, role: 'CUSTOMER', default_city_id: null };
            }
            return existingUser;
        });

        // 6. Generate Tokens
        const accessToken = jwt.sign(
            { id: user.id, role: user.role || 'CUSTOMER', city_id: user.default_city_id || 1 },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '15m' }
        );

        return {
            accessToken,
            user,
            isNewUser: !user.name // If name is missing, treat as new user
        };
    }

    async completeOnboarding(userId: number, details: any) {
        try {
            return await db.transaction(async (trx) => {
                // 1. Update User Profile
                await trx('users').where({ id: userId }).update({
                    name: details.name,
                    email: details.email,
                    whatsapp_number: details.whatsapp_number,
                    household_size: details.household_size,
                    daily_milk_liters: details.daily_milk_liters,
                    default_city_id: 1, // Default to Sakti for now
                    updated_at: new Date()
                });

                // 2. Create Primary Address
                const [addressId] = await trx('addresses').insert({
                    user_id: userId,
                    street: details.address.street,
                    city: details.address.city,
                    zip: details.address.zip,
                    lat: details.address.lat,
                    lng: details.address.lng,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                console.log(`[Onboarding] Successfully completed for user ${userId}. Address: ${addressId}`);
                return { status: 'success', addressId };
            });
        } catch (error) {
            console.error(`[Onboarding] Failed for user ${userId}:`, error);
            throw error;
        }
    }
}
