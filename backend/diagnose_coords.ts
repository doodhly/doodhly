import dotenv from 'dotenv';
dotenv.config();

import db from './src/config/db';
import { DeliveryService } from './src/modules/delivery/delivery.service';

async function diagnose() {
    const service = new DeliveryService();
    const cityId = "1"; // Sakti
    const date = "2026-01-31";

    console.log(`Diagnosing City ${cityId} on ${date}...`);

    // Check deliveries directly
    const deliveries = await service.getRunSheet(cityId, date);
    console.log(`Found ${deliveries.length} deliveries.`);

    deliveries.forEach(d => {
        console.log(`- Delivery ${d.id} for ${d.customerName}: Lat=${d.lat}, Lng=${d.lng}, TypeLat=${typeof d.lat}`);
    });

    // Check subscriptions directly
    const subs = await db('subscriptions').select('id', 'user_id', 'address_id');
    console.log('\nSubscriptions Audit:');
    subs.forEach(s => {
        console.log(`- Sub ${s.id}: User=${s.user_id}, Address=${s.address_id}`);
    });

    // Check addresses table directly
    const addresses = await db('addresses').select('*');
    console.log('\nAll Addresses:');
    addresses.forEach(a => {
        console.log(`- Address ${a.id}: User=${a.user_id}, Street=${a.street}, Lat=${a.lat}, Lng=${a.lng}`);
    });

    process.exit(0);
}

diagnose().catch(err => {
    console.error(err);
    process.exit(1);
});
