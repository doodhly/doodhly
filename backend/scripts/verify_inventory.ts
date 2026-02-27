

import 'dotenv/config';
import { inventoryForecastService } from '../src/modules/inventory/inventory.service';
import db from '../src/config/db';

async function verifyInventory() {
    console.log("--- STARTING INVENTORY VERIFICATION ---");

    try {
        // 1. Generate Forecast for Tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        console.log("Triggering forecast generation...");
        await inventoryForecastService.generateForecastForDate(tomorrow);

        // 2. data
        const dateStr = tomorrow.toISOString().split('T')[0];
        const forecasts = await db('inventory_forecasts').where('date', dateStr);

        console.log(`\n✅ Generated ${forecasts.length} forecasts for ${dateStr}`);

        if (forecasts.length > 0) {
            console.table(forecasts.map(f => ({
                product: f.product_name,
                sector: f.sector,
                predicted: f.predicted_qty,
                updated: f.updated_at
            })));
        } else {
            console.warn("⚠️ No forecasts generated. Ensure 'daily_deliveries' has data for the last 30 days.");
        }

        console.log("--- VERIFICATION SUCCESS ---");
        process.exit(0);

    } catch (error) {
        console.error("❌ VERIFICATION FAILED:", error);
        process.exit(1);
    }
}

verifyInventory();
