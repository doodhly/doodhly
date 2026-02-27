
import 'dotenv/config';
import db from '../src/config/db';

async function getTestUsers() {
    // 1. Get a Partner
    const partner = await db('users').where({ role: 'DELIVERY_PARTNER' }).first();

    // 2. Get a Customer with a delivery TODAY
    const today = new Date().toISOString().split('T')[0];
    const delivery = await db('daily_deliveries')
        .join('users', 'daily_deliveries.user_id', 'users.id')
        .where('daily_deliveries.date', today)
        .where('users.role', 'CUSTOMER')
        .select('users.phone_hash', 'users.name')
        .first();

    console.log('--- TEST CREDENTIALS ---');
    console.log(`PARTNER_PHONE=${partner ? partner.phone_hash : 'NONE'}`);
    console.log(`CUSTOMER_PHONE=${delivery ? delivery.phone_hash : 'NONE'}`);
    console.log(`CUSTOMER_NAME=${delivery ? delivery.name : 'NONE'}`);
    process.exit(0);
}

getTestUsers();
