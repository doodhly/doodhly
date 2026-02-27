import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('inventory_forecasts', (table) => {
        table.increments('id').primary();
        table.date('date').notNullable().index();
        // For now, sector is a simple string. In a real app, it might be a FK to a Sectors table.
        // We can use the 'route' or 'sector' from user profiles or addresses.
        table.string('sector').notNullable().index();
        table.integer('product_id').unsigned().notNullable().index(); // Assuming products have IDs, though we use static products often. Let's assume we map Product Name -> ID or just use string if products table doesn't exist yet (it doesn't fully).
        // Actually, we do have a products table concept in previous discussions but maybe not fully migrated.
        // Let's check if products table exists. If not, use product_name.
        // Checking previous migrations... I don't see a clear create_products_table.
        // Let's use product_name for simplicity and robustness.
        table.string('product_name').notNullable();

        table.integer('predicted_qty').notNullable().defaultTo(0);
        table.integer('actual_qty').nullable(); // To be filled after delivery completion
        table.integer('admin_override_qty').nullable(); // For manual adj

        table.timestamps(true, true);

        // Compound index for unique daily forecasts per product/sector
        table.unique(['date', 'sector', 'product_name']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('inventory_forecasts');
}

