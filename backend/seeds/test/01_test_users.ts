import { Knex } from 'knex';
import crypto from 'crypto';

export async function seed(knex: Knex): Promise<void> {
    // Clear existing test data first
    await knex('verification_codes').del();
    await knex('refresh_tokens').del();
    await knex('referrals').del();
    await knex('addresses').del();
    await knex('wallets').del();
    await knex('users').del();

    // Insert test users
    const users = [
        {
            id: 1,
            phone_hash: crypto.createHash('sha256').update('+919876543210').digest('hex'),
            name: 'Test User',
            role: 'CUSTOMER',
            is_active: true,
            referral_code: 'TEST001',
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: 2,
            phone_hash: crypto.createHash('sha256').update('+919999999999').digest('hex'),
            name: 'Test User 2',
            role: 'CUSTOMER',
            is_active: true,
            referral_code: 'TEST002',
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    await knex('users').insert(users);

    // Insert test wallets
    const wallets = [
        {
            user_id: 1,
            balance: 10000, // ₹100 in paisa
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            user_id: 2,
            balance: 5000, // ₹50 in paisa
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    await knex('wallets').insert(wallets);

    // Insert test addresses
    const addresses = [
        {
            id: 1,
            user_id: 1,
            street: '123 Test Street',
            city: 'Sakti',
            zip: '495689',
            lat: 22.0234,
            lng: 82.9628,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    await knex('addresses').insert(addresses);
}
