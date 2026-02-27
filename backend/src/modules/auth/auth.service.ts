
import db from '../../config/db';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../../core/errors/app-error';
import { SmsService } from '../notification/sms.service';
import logger from '../../core/utils/logger';

import { secrets } from '../../config/secrets';

const smsService = new SmsService();

export class AuthService {

    private hashOtp(otp: string): string {
        return crypto.createHash('sha256').update(otp).digest('hex');
    }

    private generateReferralCode(): string {
        // 6 characters, uppercase alphanumeric (excluding ambiguous I, O, 1, 0)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(crypto.randomInt(0, chars.length));
        }
        return result;
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
            logger.info(`[DEV] OTP for ${phone}: ${code} (Auto-login enabled)`);
        }

        return { message: 'OTP sent successfully' };
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    async loginWithPhone(phone: string, otp: string, referralCode?: string) {
        // Backdoor for development (Skip detailed checks if strictly dev and using backdoor OTP)
        if (otp === '1234' && process.env.NODE_ENV === 'development') {
            logger.warn(`[BACKDOOR] Bypassing OTP check for phone: ${phone}`);
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
                // Generate unique referral code (simple retry logic for collision)
                let myReferralCode = this.generateReferralCode();

                const [newUserId] = await trx('users').insert({
                    phone_hash: phone,
                    role: 'CUSTOMER',
                    referral_code: myReferralCode
                });

                // Init Wallet
                await trx('wallets').insert({
                    user_id: newUserId,
                    balance: 0
                });

                // Process Incoming Referral (if any)
                if (referralCode) {
                    const referrer = await trx('users').where({ referral_code: referralCode }).first();
                    if (referrer) {
                        await trx('referrals').insert({
                            id: crypto.randomUUID(),
                            referrer_id: referrer.id,
                            referee_id: newUserId,
                            status: 'PENDING',
                            reward_amount_paisa: 5000 // 50 Rupees
                        });
                        logger.info(`[Referral] User ${newUserId} referred by ${referrer.id}`);
                    }
                }

                existingUser = { id: newUserId, role: 'CUSTOMER', default_city_id: null, referral_code: myReferralCode };
            }
            return existingUser;
        });

        // 6. Generate Tokens
        const accessToken = jwt.sign(
            { id: user.id, role: user.role || 'CUSTOMER', city_id: user.default_city_id || 1 },
            secrets.JWT_SECRET,
            { expiresIn: '15m', algorithm: 'HS256' }
        );

        const tokenFamily = crypto.randomUUID();
        const refreshToken = jwt.sign(
            { id: user.id, type: 'refresh', family: tokenFamily },
            secrets.JWT_REFRESH_SECRET || (secrets.JWT_SECRET + '_refresh'),
            { expiresIn: '7d', algorithm: 'HS256' }
        );

        // 7. Store refreshToken hash in DB
        await db('refresh_tokens').insert({
            user_id: user.id,
            token_hash: this.hashToken(refreshToken),
            token_family: tokenFamily,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return {
            accessToken,
            refreshToken,
            user,
            isNewUser: !user.name
        };
    }

    async refresh(oldRefreshToken: string) {
        try {
            const secret = secrets.JWT_REFRESH_SECRET || (secrets.JWT_SECRET + '_refresh');
            const payload = jwt.verify(oldRefreshToken, secret, { algorithms: ['HS256'] }) as any;

            if (payload.type !== 'refresh' || !payload.family) {
                throw new AppError('Invalid refresh token', 401);
            }

            const tokenHash = this.hashToken(oldRefreshToken);

            // 1. Find token in DB
            const storedToken = await db('refresh_tokens')
                .where({ token_hash: tokenHash })
                .first();

            // 2. Reuse Detection
            if (!storedToken || storedToken.revoked_at) {
                // If token is revoked or doesn't exist (but was signed by us), suspect theft
                // Revoke entire family if it exists
                if (payload.family) {
                    await db('refresh_tokens')
                        .where({ token_family: payload.family })
                        .update({ revoked_at: new Date() });
                }
                throw new AppError('Token revoked or reuse detected. Please re-authenticate.', 401);
            }

            if (storedToken.used_at) {
                // TOKEN REUSE DETECTED!
                await db('refresh_tokens')
                    .where({ token_family: payload.family })
                    .update({ revoked_at: new Date() });
                throw new AppError('Token already used. Security breach suspected. All tokens revoked.', 401);
            }

            // 3. Mark old token as used
            await db('refresh_tokens')
                .where({ id: storedToken.id })
                .update({ used_at: new Date() });

            // 4. Issue new tokens
            const user = await db('users').where({ id: payload.id }).first();
            if (!user) throw new AppError('User not found', 401);

            const accessToken = jwt.sign(
                { id: user.id, role: user.role, city_id: user.default_city_id || 1 },
                secrets.JWT_SECRET,
                { expiresIn: '15m', algorithm: 'HS256' }
            );

            // Rotate refresh token (KEEP SAME FAMILY)
            const newRefreshToken = jwt.sign(
                { id: user.id, type: 'refresh', family: payload.family },
                secret,
                { expiresIn: '7d', algorithm: 'HS256' }
            );

            // Store new token hash
            await db('refresh_tokens').insert({
                user_id: user.id,
                token_hash: this.hashToken(newRefreshToken),
                token_family: payload.family,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            return { accessToken, refreshToken: newRefreshToken };
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError('Refresh failed', 401);
        }
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

                logger.info(`[Onboarding] Successfully completed for user ${userId}. Address: ${addressId}`);
                return { status: 'success', addressId };
            });
        } catch (error) {
            logger.error(`[Onboarding] Failed for user ${userId}:`, error);
            throw error;
        }
    }
}
