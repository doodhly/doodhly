import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    if (await knex.schema.hasTable('subscriptions')) {
        await knex.schema.alterTable('subscriptions', (table) => {
            table.integer('city_id').unsigned().nullable().index();
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    if (await knex.schema.hasTable('subscriptions')) {
        await knex.schema.alterTable('subscriptions', (table) => {
            table.dropColumn('city_id');
        });
    }
}
