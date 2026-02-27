import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // 1. Create Referrals Table
    await knex.schema.createTable('referrals', (table) => {
        table.string('id').primary(); // UUID
        table.integer('referrer_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.integer('referee_id').unsigned().notNullable().unique()
            .references('id').inTable('users').onDelete('CASCADE');

        table.string('status').notNullable().defaultTo('PENDING'); // PENDING, COMPLETED
        table.integer('reward_amount_paisa').notNullable().defaultTo(5000); // 50 Rupees

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('completed_at').nullable();
    });

    // 2. Update Users Table
    await knex.schema.alterTable('users', (table) => {
        table.string('referral_code', 10).unique().nullable().index();
        table.integer('streak_count').defaultTo(0).notNullable();
        table.string('current_tier').defaultTo('SILVER').notNullable(); // SILVER, GOLD, PLATINUM
        table.bigInteger('total_spend_monthly_paisa').defaultTo(0).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    // Revert Users Table changes
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('total_spend_monthly_paisa');
        table.dropColumn('current_tier');
        table.dropColumn('streak_count');
        table.dropColumn('referral_code');
    });

    // Drop Referrals Table
    await knex.schema.dropTableIfExists('referrals');
}
