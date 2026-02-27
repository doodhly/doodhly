
import 'dotenv/config';
import db from '../src/config/db';

async function seedDeliveries() {
    console.log('--- SEEDING DELIVERIES FOR OPTIMIZATION ---');

    // 1. Find Users with Geo-coordinates
    const usersWithLocation = await db('users')
        .join('addresses', 'users.id', 'addresses.user_id')
        .whereNotNull('addresses.lat')
        .whereNotNull('addresses.lng')
        .select('users.id', 'users.name', 'addresses.lat', 'addresses.lng', 'users.default_city_id');

    console.log(`Found ${usersWithLocation.length} users with location data.`);

    if (usersWithLocation.length === 0) {
        console.warn('No users with location found. Please create users with addresses first.');
        process.exit(0);
    }

    const today = new Date().toISOString().split('T')[0];
    let createdCount = 0;

    for (const user of usersWithLocation) {
        // 2. Ensure Active Subscription
        let sub = await db('subscriptions')
            .where({ user_id: user.id, status: 'ACTIVE' })
            .first();

        if (!sub) {
            // Fetch a valid product
            const product = await db('products').first();
            if (!product) {
                console.error('No products found in DB. Please seed products first.');
                process.exit(1);
            }

            console.log(`Creating subscription for user ${user.name} (${user.id})...`);
            const [subId] = await db('subscriptions').insert({
                user_id: user.id,
                product_id: product.id,
                quantity: 1,
                frequency_type: 'DAILY',
                status: 'ACTIVE',
                start_date: today,
                city_id: user.default_city_id || 1,
                address_id: await db('addresses').where({ user_id: user.id }).first().then(a => a.id)
            });
            sub = { id: subId };
        }

        // 3. Create Daily Delivery for TODAY
        const existingDelivery = await db('daily_deliveries')
            .where({ subscription_id: sub.id, date: today })
            .first();

        if (!existingDelivery) {
            await db('daily_deliveries').insert({
                subscription_id: sub.id,
                user_id: user.id,
                date: today,
                status: 'PENDING',
                city_id: user.default_city_id || 1,
                debit_amount_paisa: 0
            });
            createdCount++;
        }
    }

    console.log(`✅ Successfully seeded ${createdCount} deliveries for ${today}.`);
    process.exit(0);
}

seedDeliveries().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
