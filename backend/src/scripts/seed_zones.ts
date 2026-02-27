import db from '../config/db';

async function seedZones() {
    try {
        console.log('Seeding service zones...');

        // Create a simple box around Sakti, India
        // Format for MySQL POLYGON: 'POLYGON((lng lat, lng lat, lng lat, lng lat, lng lat))'
        // Note: The polygon MUST be closed (first and last point must be same)
        const polyText = `POLYGON((
            82.90 22.00,
            83.00 22.00,
            83.00 22.10,
            82.90 22.10,
            82.90 22.00
        ))`;

        // Clear existing test zones
        await db('service_zones').where({ name: 'Sakti Test Zone' }).del();

        // Insert new zone using raw SQL to invoke ST_GeomFromText
        await db.raw(
            `INSERT INTO service_zones (city_id, name, is_active, service_area) VALUES (?, ?, ?, ST_GeomFromText(?))`,
            [1, 'Sakti Test Zone', true, polyText]
        );

        console.log('✅ Service Zones seeded successfully!');
    } catch (err) {
        console.error('❌ Failed to seed service zones:', err);
    } finally {
        await db.destroy();
    }
}

seedZones();
