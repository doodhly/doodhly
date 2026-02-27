import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('refresh_tokens', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.string('token_hash', 64).notNullable().unique(); // SHA-256 is 64 hex chars
        table.string('token_family', 36).notNullable(); // UUID
        table.timestamp('expires_at').notNullable();
        table.timestamp('used_at').nullable();
        table.timestamp('revoked_at').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.index(['user_id']);
        table.index(['token_hash']);
        table.index(['token_family']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('refresh_tokens');
}
