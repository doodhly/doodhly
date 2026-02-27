import { Knex } from "knex";



export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('consumption_analytics', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('month_year', 7).notNullable(); // 'MM-YYYY'
        table.float('predicted_liters').defaultTo(0);
        table.float('avg_daily_consumption').defaultTo(0);
        table.float('churn_probability').defaultTo(0);
        table.float('savings_amount').defaultTo(0);
        table.string('anomaly_status').defaultTo('NORMAL'); // 'NORMAL', 'HIGH_USAGE', 'RISK'
        table.timestamp('last_analyzed_at').defaultTo(knex.fn.now());
        table.unique(['user_id', 'month_year']);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('consumption_analytics');
}

