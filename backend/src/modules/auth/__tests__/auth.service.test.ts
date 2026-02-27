import { AuthService } from '../auth.service';
import db from '@/config/db';
import { createTestUser } from '@/__tests__/setup';
import crypto from 'crypto';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
    });

    describe('requestOtp', () => {
        it('should generate and store OTP for valid phone number', async () => {
            const phone = '+919876543210';

            const result = await authService.requestOtp(phone);

            expect(result).toEqual({ message: 'OTP sent successfully' });

            // Verify OTP was stored in database
            const record = await db('verification_codes')
                .where({ phone })
                .first();

            expect(record).toBeDefined();
            expect(record.otp_hash).toBeDefined();
            expect(record.expires_at).toBeInstanceOf(Date);
            expect(record.attempts).toBe(0);
            expect(record.is_verified).toBe(false);
        });

        it('should invalidate previous OTP for same phone', async () => {
            const phone = '+919876543210';

            // Request OTP twice
            await authService.requestOtp(phone);
            await authService.requestOtp(phone);

            // Should only have one record
            const records = await db('verification_codes')
                .where({ phone });

            expect(records).toHaveLength(1);
        });

        it('should set expiration to 5 minutes from now', async () => {
            const phone = '+919876543210';
            const before = Date.now();

            await authService.requestOtp(phone);

            const record = await db('verification_codes')
                .where({ phone })
                .first();

            const expiresAt = new Date(record.expires_at).getTime();
            const expectedExpiry = before + 5 * 60 * 1000;

            // Allow 1 second tolerance
            expect(expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 1000);
            expect(expiresAt).toBeLessThanOrEqual(expectedExpiry + 1000);
        });
    });

    describe('loginWithPhone', () => {
        it('should allow login with development backdoor OTP', async () => {
            const phone = '+919876543210';
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const result = await authService.loginWithPhone(phone, '1234');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('user');
            expect(result.isNewUser).toBe(true);

            process.env.NODE_ENV = originalEnv;
        });

        it('should reject expired OTP', async () => {
            const phone = '+919876543210';
            const otp = '123456';
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            // Insert expired OTP
            await db('verification_codes').insert({
                phone,
                otp_hash: otpHash,
                expires_at: new Date(Date.now() - 1000), // Expired 1 second ago
                attempts: 0,
                is_verified: false,
            });

            await expect(
                authService.loginWithPhone(phone, otp)
            ).rejects.toThrow('OTP expired or not found');
        });

        it('should reject invalid OTP', async () => {
            const phone = '+919876543210';
            const correctOtp = '123456';
            const wrongOtp = '654321';
            const otpHash = crypto.createHash('sha256').update(correctOtp).digest('hex');

            await db('verification_codes').insert({
                phone,
                otp_hash: otpHash,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
                attempts: 0,
                is_verified: false,
            });

            await expect(
                authService.loginWithPhone(phone, wrongOtp)
            ).rejects.toThrow('Invalid OTP');

            // Verify attempts incremented
            const record = await db('verification_codes')
                .where({ phone })
                .first();

            expect(record.attempts).toBe(1);
        });

        it('should block after 5 failed attempts', async () => {
            const phone = '+919876543210';
            const correctOtp = '123456';
            const otpHash = crypto.createHash('sha256').update(correctOtp).digest('hex');

            await db('verification_codes').insert({
                phone,
                otp_hash: otpHash,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
                attempts: 5, // Already at limit
                is_verified: false,
            });

            await expect(
                authService.loginWithPhone(phone, '000000')
            ).rejects.toThrow('Too many attempts');

            // Verify record was deleted
            const record = await db('verification_codes')
                .where({ phone })
                .first();

            expect(record).toBeUndefined();
        });

        it('should create new user and wallet on first login', async () => {
            const phone = '+919876543210';
            const otp = '123456';
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            await db('verification_codes').insert({
                phone,
                otp_hash: otpHash,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
                attempts: 0,
                is_verified: false,
            });

            const result = await authService.loginWithPhone(phone, otp);

            expect(result.isNewUser).toBe(true);
            expect(result.user.id).toBeDefined();
            expect(result.user.role).toBe('CUSTOMER');
            expect(result.user.referral_code).toBeDefined();

            // Verify wallet was created
            const wallet = await db('wallets')
                .where({ user_id: result.user.id })
                .first();

            expect(wallet).toBeDefined();
            expect(wallet.balance).toBe(0);
        });

        it('should return existing user on subsequent login', async () => {
            const phone = '+919876543210';

            // Create existing user
            const existingUser = await createTestUser({ phone_hash: phone });

            const otp = '123456';
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            await db('verification_codes').insert({
                phone,
                otp_hash: otpHash,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
                attempts: 0,
                is_verified: false,
            });

            const result = await authService.loginWithPhone(phone, otp);

            expect(result.user.id).toBe(existingUser.id);
            expect(result.isNewUser).toBe(false); // Has name set
        });

        it('should process referral code on signup', async () => {
            const referrerPhone = '+919999999999';
            const refereePhone = '+918888888888';

            // Create referrer user
            const referrer = await createTestUser({
                phone_hash: referrerPhone,
                referral_code: 'REFER1',
            });

            const otp = '123456';
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            await db('verification_codes').insert({
                phone: refereePhone,
                otp_hash: otpHash,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
                attempts: 0,
                is_verified: false,
            });

            const result = await authService.loginWithPhone(
                refereePhone,
                otp,
                'REFER1' // Referral code
            );

            // Verify referral was created
            const referral = await db('referrals')
                .where({ referrer_id: referrer.id, referee_id: result.user.id })
                .first();

            expect(referral).toBeDefined();
            expect(referral.status).toBe('PENDING');
            expect(referral.reward_amount_paisa).toBe(5000);
        });

        it('should delete OTP after successful login', async () => {
            const phone = '+919876543210';
            const otp = '123456';
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            await db('verification_codes').insert({
                phone,
                otp_hash: otpHash,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
                attempts: 0,
                is_verified: false,
            });

            await authService.loginWithPhone(phone, otp);

            // Verify OTP was deleted (prevents replay)
            const record = await db('verification_codes')
                .where({ phone })
                .first();

            expect(record).toBeUndefined();
        });
    });

    describe('refresh', () => {
        it('should issue new tokens with valid refresh token', async () => {
            const phone = '+919876543210';

            // First login
            const otp = '123456';
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            await db('verification_codes').insert({
                phone,
                otp_hash: otpHash,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
                attempts: 0,
                is_verified: false,
            });

            const loginResult = await authService.loginWithPhone(phone, otp);
            const oldRefreshToken = loginResult.refreshToken;

            // Refresh
            const refreshResult = await authService.refresh(oldRefreshToken);

            expect(refreshResult).toHaveProperty('accessToken');
            expect(refreshResult).toHaveProperty('refreshToken');
            expect(refreshResult.refreshToken).not.toBe(oldRefreshToken);
        });

        it('should detect token reuse and revoke family', async () => {
            const phone = '+919876543210';

            // Login and get refresh token
            const otp = '123456';
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            await db('verification_codes').insert({
                phone,
                otp_hash: otpHash,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
                attempts: 0,
                is_verified: false,
            });

            const loginResult = await authService.loginWithPhone(phone, otp);
            const refreshToken = loginResult.refreshToken;

            // Use token once
            await authService.refresh(refreshToken);

            // Try to reuse the same token
            await expect(
                authService.refresh(refreshToken)
            ).rejects.toThrow('Token already used');

            // Verify entire family was revoked
            const tokens = await db('refresh_tokens')
                .where({ user_id: loginResult.user.id })
                .whereNotNull('revoked_at');

            expect(tokens.length).toBeGreaterThan(0);
        });

        it('should reject invalid refresh token', async () => {
            const invalidToken = 'invalid.token.here';

            await expect(
                authService.refresh(invalidToken)
            ).rejects.toThrow('Refresh failed');
        });
    });

    describe('completeOnboarding', () => {
        it('should update user profile and create address', async () => {
            const user = await createTestUser();

            const onboardingDetails = {
                name: 'John Doe',
                email: 'john@example.com',
                whatsapp_number: '+919876543210',
                household_size: 4,
                daily_milk_liters: 2,
                address: {
                    street: '123 Main St',
                    city: 'Sakti',
                    zip: '495689',
                    lat: 22.0234,
                    lng: 82.9628,
                },
            };

            const result = await authService.completeOnboarding(user.id, onboardingDetails);

            expect(result.status).toBe('success');
            expect(result.addressId).toBeDefined();

            // Verify user was updated
            const updatedUser = await db('users')
                .where({ id: user.id })
                .first();

            expect(updatedUser.name).toBe('John Doe');
            expect(updatedUser.email).toBe('john@example.com');
            expect(updatedUser.household_size).toBe(4);

            // Verify address was created
            const address = await db('addresses')
                .where({ id: result.addressId })
                .first();

            expect(address.street).toBe('123 Main St');
            expect(address.lat).toBe(22.0234);
        });
    });
});
