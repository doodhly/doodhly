import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('addresses', (table) => {
        // Change lat/lng to decimal with 7 digits after decimal point
        // Total 10 digits, 7 after decimal: e.g. 123.4567890
        table.decimal('lat', 10, 7).alter();
        table.decimal('lng', 10, 7).alter();

        // Add accuracy column
        table.float('accuracy').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('addresses', (table) => {
        table.double('lat').alter();
        table.double('lng').alter();
        table.dropColumn('accuracy');
    });
}
