import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    const hasTable = await knex.schema.hasTable('service_zones');
    if (!hasTable) {
        await knex.schema.createTable('service_zones', (table) => {
            table.increments('id').primary();
            table.integer('city_id').unsigned().notNullable(); // Matches users.default_city_id
            table.string('name').notNullable();
            table.boolean('is_active').defaultTo(true);

            // MySQL Spatial column for Polygon
            // Knex specificType allows custom database types
            table.specificType('service_area', 'POLYGON').notNullable();

            table.timestamps(true, true);
        });

        // Add spatial index for efficient querying
        await knex.raw('ALTER TABLE service_zones ADD SPATIAL INDEX(service_area)');
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('service_zones');
}
