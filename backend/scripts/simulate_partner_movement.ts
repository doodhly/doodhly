
import { io } from "socket.io-client";
import 'dotenv/config';

// Configuration
const PARTNER_ID = 4; // From seed data (Sambhav is 3, Partner is likely 4 or found in DB)
// We need to match the Partner ID that has the delivery assigned. 
// In seed_deliveries, we created deliveries but didn't assign a specific partner explicitly in 'daily_deliveries' table?
// Wait, daily_deliveries usually has a 'delivery_partner_id' column if assigned?
// Let's check `seed_deliveries_for_optimization.ts`... it inserted into `daily_deliveries`.
// It did NOT set `assigned_to` or similar? 
// The schema `20260120130000_add_delivery_staff_cols.ts` might have added it.
// Let's assume for this test, the Backend doesn't strictly validate *match* for socket updates, 
// OR we need to fetch the delivery ID to emit correctly.

// Actually, `LocationTracker.tsx` emits:
// deliveryId, partnerId, lat, lng.

// We need a valid DELIVERY_ID for the customer.
// We found Customer Phone 9111111938 (User 3).
// We need to fetch the delivery ID for User 3 today.

import db from '../src/config/db';
import { withMutex } from '../src/core/utils/redis-mutex';

async function simulate(): Promise<void> {
    console.log('--- PARTNER SIMULATION STARTING ---');

    // 1. Get Delivery ID for the Test User (Sambhav - 9111111938)
    const today = new Date().toISOString().split('T')[0];
    const targetPhone = '9111111938';

    const user = await db('users').where('phone_hash', targetPhone).first();
    if (!user) {
        console.error(`User with phone ${targetPhone} not found`);
        process.exit(1);
    }

    const delivery = await db('daily_deliveries')
        .where({ date: today, user_id: user.id })
        .first();

    if (!delivery) {
        console.error('No delivery found for User 3 today.');
        process.exit(1);
    }

    const DELIVERY_ID = delivery.id;
    const SOCKET_URL = 'http://localhost:5000';

    console.log(`Simulating Partner for Delivery ID: ${DELIVERY_ID} to ${SOCKET_URL}`);

    const socket = io(SOCKET_URL, {
        path: "/socket.io"
    });

    return new Promise<void>((resolve) => {
        socket.on("connect", () => {
            console.log(`Connected to Backend: ${socket.id}`);

            // Start emitting
            let lat = 12.9716;
            let lng = 77.5946;
            let step = 0;

            setInterval(() => {
                lat += 0.0001; // Move slightly
                lng += 0.0001;
                step++;

                const payload = {
                    deliveryId: DELIVERY_ID,
                    partnerId: 4, // Mock Partner ID
                    lat,
                    lng,
                    speed: 15.5, // km/h
                    heading: 45
                };

                socket.emit("update_location", payload);
                console.log(`Emitted loc #${step}: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }, 2000); // Every 2 seconds
        });

        socket.on("disconnect", () => {
            console.log("Disconnected");
            resolve();
        });

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n⏸ Shutting down gracefully...');
            socket.disconnect();
            process.exit(0);
        });
    });
}

// Run with Redis mutex protection
(async () => {
    const result = await withMutex('partner_simulation', simulate, 600); // 10 min TTL

    if (result === null) {
        console.error('❌ Another simulation is already running. Exiting.');
        process.exit(1);
    }

    console.log('✅ Simulation completed');
})();
