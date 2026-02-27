import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable('delivery_locations'))) {
        await knex.schema.createTable('delivery_locations', (table) => {
            table.bigIncrements('id').primary();

            table.integer('delivery_id').unsigned().notNullable()
                .references('id').inTable('daily_deliveries').onDelete('CASCADE');

            table.integer('partner_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');

            table.decimal('lat', 10, 8).notNullable();
            table.decimal('lng', 11, 8).notNullable();

            table.float('speed').nullable();
            table.float('heading').nullable();

            table.timestamp('timestamp').defaultTo(knex.fn.now());

            // Index for fast retrieval of latest location
            table.index(['delivery_id', 'timestamp']);
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('delivery_locations');
}
