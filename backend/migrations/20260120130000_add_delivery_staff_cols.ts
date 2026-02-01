import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    if (await knex.schema.hasTable('daily_deliveries')) {
        await knex.schema.alterTable('daily_deliveries', (table) => {
            // Using string to match potentially non-int driver IDs or consistent with other IDs
            // Migration for users uses Int ID. assigned_staff_id should likely be Int FK?
            // "users" table is "id" (Int).
            // But strict requirement: "assigned_staff_id" used in Service.
            // I'll make it Integer and FK to users nullable.
            table.integer('assigned_staff_id').unsigned().nullable()
                .references('id').inTable('users').onDelete('SET NULL');

            // Also adding city_id for faster RBAC checks
            table.integer('city_id').nullable(); // Denormalized for perf
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    if (await knex.schema.hasTable('daily_deliveries')) {
        await knex.schema.alterTable('daily_deliveries', (table) => {
            table.dropColumn('assigned_staff_id');
            table.dropColumn('city_id');
        });
    }
}
