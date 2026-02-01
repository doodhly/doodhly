import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("products").del();

    // Inserts seed entries
    await knex("products").insert([
        {
            name: "Pure Cow Milk",
            description: "Fresh, unadulterated cow milk delivered daily.",
            price_paisa: 6000, // ₹60
            unit: "Ltr",
            is_active: true
        },
        {
            name: "Buffalo Milk",
            description: "Rich and creamy buffalo milk for thick curd.",
            price_paisa: 8000, // ₹80
            unit: "Ltr",
            is_active: true
        }
    ]);

    console.log("Products seeded successfully.");
}
