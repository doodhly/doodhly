import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // 1. Ensure Sakti City exists/is used
    const cityId = 1;

    // 2. Fetch an active product
    const product = await knex('products').where({ is_active: true }).first();
    if (!product) {
        console.error("No active products found. Run product seeds first.");
        return;
    }

    // 3. Test Customers Data
    const customers = [
        { name: "Rahul Sharma", phone: "9100000001", street: "Main Road, Sakti", lat: 22.025, lng: 82.955 },
        { name: "Priya Patel", phone: "9100000002", street: "Station Road, Sakti", lat: 22.028, lng: 82.958 },
        { name: "Amit Gupta", phone: "9100000003", street: "Civil Lines, Sakti", lat: 22.022, lng: 82.952 }
    ];

    // 4. Partner Data
    const partnerPhone = "9900000000";

    // Clean up existing test data
    await knex('users').whereIn('phone_hash', [...customers.map(c => c.phone), partnerPhone]).del();

    // Insert Partner
    const [partnerId] = await knex('users').insert({
        name: "Delivery Partner",
        phone_hash: partnerPhone,
        role: 'DELIVERY_PARTNER',
        default_city_id: cityId
    });

    console.log(`Created Delivery Partner with ID: ${partnerId}`);

    for (const c of customers) {
        // Create User
        const [userId] = await knex('users').insert({
            name: c.name,
            phone_hash: c.phone,
            role: 'CUSTOMER',
            default_city_id: cityId,
            daily_milk_liters: 1
        });

        // Create Wallet
        await knex('wallets').insert({
            user_id: userId,
            balance: 100000 // ₹1000
        });

        // Create Address
        const [addressId] = await knex('addresses').insert({
            user_id: userId,
            street: c.street,
            city: "Sakti",
            lat: c.lat,
            lng: c.lng,
            accuracy: 15
        });

        // Create Subscription
        await knex('subscriptions').insert({
            user_id: userId,
            city_id: cityId,
            product_id: product.id,
            address_id: addressId,
            quantity: 1,
            frequency_type: 'DAILY',
            start_date: '2026-01-01',
            status: 'ACTIVE'
        });

        console.log(`Created Customer ${c.name} with subscription at ${c.street}`);
    }
};
