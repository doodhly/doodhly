import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', (table) => {
        table.boolean('is_active').defaultTo(true).notNullable();
        table.timestamp('last_seen_at').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('is_active');
        table.dropColumn('last_seen_at');
    });
}
