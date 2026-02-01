import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('verification_codes', (table) => {
        table.increments('id').primary();
        table.string('phone').notNullable().index();
        table.string('otp_hash').notNullable(); // Hashed OTP
        table.integer('attempts').defaultTo(0);
        table.boolean('is_verified').defaultTo(false);
        table.timestamp('expires_at').notNullable().index();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('verification_codes');
}

