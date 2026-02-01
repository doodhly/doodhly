import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('users', (table) => {
        table.string('whatsapp_number').nullable();
        table.integer('household_size').nullable();
        table.decimal('daily_milk_liters', 5, 2).nullable(); // e.g. 999.99
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('users', (table) => {
        table.dropColumn('whatsapp_number');
        table.dropColumn('household_size');
        table.dropColumn('daily_milk_liters');
    });
}

