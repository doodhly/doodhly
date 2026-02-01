import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

    // 1. Audit Table (Resolving Middleware Reference)
    if (!(await knex.schema.hasTable('data_audit_logs'))) {
        await knex.schema.createTable('data_audit_logs', (table) => {
            table.increments('id').primary();
            table.string('table_name').notNullable();
            table.string('action').notNullable(); // POST, PUT, DELETE
            table.integer('actor_id').unsigned().nullable();
            table.string('ip_address').nullable();
            table.text('payload').nullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // 2. Payment Transactions Hardening
    await knex.schema.alterTable('payment_transactions', (table) => {
        table.renameColumn('amount', 'amount_paisa');
    });

    // 3. Daily Deliveries Hardening
    await knex.schema.alterTable('daily_deliveries', (table) => {
        table.renameColumn('debit_amount', 'debit_amount_paisa');
    });

    // 4. Wallet Ledger Hardening (Standardize for Audit Trail)
    await knex.schema.alterTable('wallet_ledger', (table) => {
        // Rename amount to amount_paisa
        table.renameColumn('amount', 'amount_paisa');

        // Add balance snapshot for financial integrity
        table.bigInteger('balance_after_paisa').nullable();

        // Ensure type field allows 'ADJUSTMENT'
        // Indexing for faster history lookups
        table.index(['wallet_id', 'created_at']);
    });

    // 3. Performance Indexes (Scale Hardening)
    await knex.schema.alterTable('daily_deliveries', (table) => {
        table.index(['date', 'city_id']);
        table.index(['user_id', 'date']);
    });

    await knex.schema.alterTable('users', (table) => {
        table.index(['last_seen_at']);
        table.index(['role', 'is_active']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', (table) => {
        table.dropIndex(['last_seen_at']);
        table.dropIndex(['role', 'is_active']);
    });

    await knex.schema.alterTable('daily_deliveries', (table) => {
        table.dropIndex(['date', 'city_id']);
        table.dropIndex(['user_id', 'date']);
    });

    await knex.schema.alterTable('wallet_ledger', (table) => {
        table.dropIndex(['wallet_id', 'created_at']);
        table.dropColumn('balance_after_paisa');
        table.renameColumn('amount_paisa', 'amount');
    });

    await knex.schema.alterTable('payment_transactions', (table) => {
        table.renameColumn('amount_paisa', 'amount');
    });

    await knex.schema.alterTable('daily_deliveries', (table) => {
        table.renameColumn('debit_amount_paisa', 'debit_amount');
    });

    await knex.schema.dropTableIfExists('data_audit_logs');
}
