import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Clear existing test data
    await knex('subscriptions').del();
    await knex('products').del();

    // Insert test products
    const products = [
        {
            id: 1,
            name: 'Test Full Cream Milk',
            price_paisa: 5000, // ₹50
            unit: 'L',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: 2,
            name: 'Test Toned Milk',
            price_paisa: 4500, // ₹45
            unit: 'L',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    await knex('products').insert(products);

    // Insert test subscriptions
    const subscriptions = [
        {
            id: 1,
            user_id: 1,
            product_id: 1,
            quantity: 2,
            start_date: new Date(),
            frequency_type: 'DAILY',
            address_id: 1,
            status: 'ACTIVE',
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    await knex('subscriptions').insert(subscriptions);
}
