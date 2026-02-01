import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('payment_transactions', (table) => {
        table.string('id').primary(); // Internal UUID
        table.string('user_id').notNullable().index();
        table.decimal('amount', 10, 2).notNullable();
        table.string('currency').defaultTo('INR');

        table.string('provider_order_id').unique().notNullable(); // Razorpay Order ID
        table.string('provider_payment_id').nullable();
        table.string('status').notNullable().defaultTo('PENDING'); // PENDING, SUCCESS, FAILED

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('payment_transactions');
}
