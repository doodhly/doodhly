
import axios from 'axios';

const API_URL = "http://localhost:5001/api/v1/partner/optimize";

const mockDeliveries = [
    { id: 1, lat: 12.9716, lng: 77.5946, sequence: 1 }, // Bangalore Center
    { id: 2, lat: 12.9352, lng: 77.6245, sequence: 2 }, // Koramangala (South East)
    { id: 3, lat: 13.0358, lng: 77.5970, sequence: 3 }, // Hebbal (North)
    { id: 4, lat: 12.9784, lng: 77.6408, sequence: 4 }, // Indiranagar (East)
    { id: 5, lat: 12.9141, lng: 77.6103, sequence: 5 }  // BTM Layout (South)
];

// Expected intuitive route: Center -> Indiranagar -> Koramangala -> BTM -> Hebbal (or similar loop)
// Randomizing input sequence to test sorting
const shuffled = [...mockDeliveries].sort(() => Math.random() - 0.5);

async function verifyOptimization() {
    console.log("--- STARTING ROUTE OPTIMIZATION VERIFICATION ---");
    console.log("Input Sequence IDs:", shuffled.map(d => d.id).join(" -> "));

    try {
        const response = await axios.post(API_URL, { deliveries: shuffled });
        const { optimizedRoute, savings } = response.data;

        console.log("\n✅ Optimization Successful");
        console.log("Output Sequence IDs:", optimizedRoute.map((d: any) => d.id).join(" -> "));
        console.log("Savings:", savings);

        // Basic check: length preserved
        if (optimizedRoute.length !== shuffled.length) {
            throw new Error("Mismatch in input/output length");
        }

        console.log("--- VERIFICATION SUCCESS ---");

    } catch (error: any) {
        console.error("❌ VERIFICATION FAILED:", error.message);
        if (error.response) {
            console.error("Response:", error.response.data);
        }
        process.exit(1);
    }
}

verifyOptimization();
