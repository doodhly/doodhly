import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

    // 1. Wallets (One-to-One with Users)
    if (!(await knex.schema.hasTable('wallets'))) {
        await knex.schema.createTable('wallets', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().unique()
                .references('id').inTable('users').onDelete('CASCADE');

            // Financials in PAISA (BigInt preferred, but standard Int safe up to 21 Million Rupees. BigInt safer).
            // Using bigint for balance to avoid overflow.
            table.bigInteger('balance').defaultTo(0).notNullable();
            table.string('currency').defaultTo('INR');
            table.timestamps(true, true);
        });
    }

    // 2. Wallet Ledger (Immutable Audit)
    if (!(await knex.schema.hasTable('wallet_ledger'))) {
        await knex.schema.createTable('wallet_ledger', (table) => {
            table.increments('id').primary();
            table.integer('wallet_id').unsigned().notNullable()
                .references('id').inTable('wallets').onDelete('CASCADE');

            table.integer('amount').notNullable(); // Positive or Negative Paisa
            table.string('direction').notNullable(); // CREDIT / DEBIT
            table.string('type').notNullable(); // RECHARGE, ORDER_DEDUCTION, REFUND, ADJUSTMENT
            table.string('reference_id').nullable(); // Order ID or Delivery ID or Payment ID
            table.string('description').nullable();

            table.timestamp('created_at').defaultTo(knex.fn.now());
            // No updated_at, ledger is immutable
        });
    }

    // 3. Products (Milk types)
    if (!(await knex.schema.hasTable('products'))) {
        await knex.schema.createTable('products', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('description').nullable();
            table.integer('price_paisa').notNullable(); // Price per unit in Paisa
            table.string('unit').defaultTo('Ltr');
            table.boolean('is_active').defaultTo(true);
            table.timestamps(true, true);
        });
    }

    // 4. Addresses (User Addresses)
    // Implicitly needed for Subscriptions
    if (!(await knex.schema.hasTable('addresses'))) {
        await knex.schema.createTable('addresses', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.string('street').notNullable();
            table.string('city').nullable();
            table.string('zip').nullable();
            table.double('lat').nullable();
            table.double('lng').nullable();
            table.timestamps(true, true);
        });
    }

    // 5. Subscriptions
    if (!(await knex.schema.hasTable('subscriptions'))) {
        await knex.schema.createTable('subscriptions', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.integer('product_id').unsigned().notNullable()
                .references('id').inTable('products').onDelete('RESTRICT');
            table.integer('address_id').unsigned().nullable(); // Ideally FK to addresses

            table.integer('quantity').notNullable(); // Default 1
            table.string('frequency_type').notNullable(); // DAILY, ALTERNATE
            table.string('status').defaultTo('ACTIVE'); // ACTIVE, PAUSED, CANCELLED

            table.date('start_date').notNullable();
            table.timestamps(true, true);
        });
    }

    // 6. Subscription Pauses
    if (!(await knex.schema.hasTable('subscription_pauses'))) {
        await knex.schema.createTable('subscription_pauses', (table) => {
            table.increments('id').primary();
            table.integer('subscription_id').unsigned().notNullable()
                .references('id').inTable('subscriptions').onDelete('CASCADE');
            table.date('start_date').notNullable();
            table.date('end_date').nullable();
            table.timestamps(true, true);
        });
    }

    // 7. Daily Deliveries (The Run Sheet Item)
    if (!(await knex.schema.hasTable('daily_deliveries'))) {
        await knex.schema.createTable('daily_deliveries', (table) => {
            table.increments('id').primary(); // Use UUID typically, but sticking to Int for consistency
            table.integer('subscription_id').unsigned().notNullable()
                .references('id').inTable('subscriptions').onDelete('CASCADE');
            table.integer('user_id').unsigned().notNullable() // Redundant but useful for indexing
                .references('id').inTable('users').onDelete('CASCADE');

            table.date('date').notNullable();
            table.string('status').defaultTo('PENDING'); // PENDING, DELIVERED, MISSED, CANCELLED

            // Financial Audit for this specific delivery
            table.integer('debit_amount').notNullable(); // Amount deducted in Paisa
            table.string('proof_type').nullable(); // COUPON, PHOTO

            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());

            // Constraint: One delivery per sub per date
            table.unique(['subscription_id', 'date']);
        });
    }

    // 8. Coupons (For Delivery Proof)
    if (!(await knex.schema.hasTable('coupons'))) {
        await knex.schema.createTable('coupons', (table) => {
            table.increments('id').primary();
            table.string('code').notNullable().unique();
            table.integer('linked_delivery_id').unsigned().nullable()
                .references('id').inTable('daily_deliveries').onDelete('CASCADE');
            table.string('status').defaultTo('GENERATED'); // GENERATED, SCANNED, VOID
            table.timestamp('scanned_at').nullable();
            table.string('scanner_id').nullable(); // Driver ID
            table.timestamps(true, true);
        });
    }

    // 9. Payment Transactions (FIX: Recreate with strict FK)
    // We check if it exists and has wrong schema, or just drop and recreate for safety in this sprint.
    if (await knex.schema.hasTable('payment_transactions')) {
        // Optional: Could check structure, but simple drop/create is safer for hardening.
        await knex.schema.dropTable('payment_transactions');
    }

    await knex.schema.createTable('payment_transactions', (table) => {
        table.string('id').primary(); // Internal UUID (Crypto)
        table.integer('user_id').unsigned().notNullable().index()
            .references('id').inTable('users').onDelete('CASCADE');

        table.integer('amount').notNullable(); // CHANGE: PAISA (Integer)
        table.string('currency').defaultTo('INR');

        table.string('provider_order_id').unique().notNullable(); // Razorpay Order ID
        table.string('provider_payment_id').nullable();
        table.string('status').notNullable().defaultTo('PENDING'); // PENDING, SUCCESS, FAILED

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('coupons');
    await knex.schema.dropTableIfExists('daily_deliveries');
    await knex.schema.dropTableIfExists('subscription_pauses');
    await knex.schema.dropTableIfExists('subscriptions');
    await knex.schema.dropTableIfExists('products');
    await knex.schema.dropTableIfExists('wallet_ledger');
    await knex.schema.dropTableIfExists('wallets');
    await knex.schema.dropTableIfExists('addresses');
    await knex.schema.dropTableIfExists('payment_transactions');
}
