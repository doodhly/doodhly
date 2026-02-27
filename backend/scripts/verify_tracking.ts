
import { io as Client } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
const DELIVERY_ID = 999;
const PARTNER_ID = 888;

async function verifyTracking() {
    console.log("--- STARTING TRACKING VERIFICATION ---");

    // 1. Setup Customer Client
    const customerSocket = Client(SOCKET_URL, {
        path: "/socket.io" // Default path, but being explicit based on server config
    });

    // Connect to /tracking namespace
    const customerTracking = Client(`${SOCKET_URL}/tracking`, {
        path: "/socket.io"
    });

    // 2. Setup Partner Client
    const partnerTracking = Client(`${SOCKET_URL}/tracking`, {
        path: "/socket.io"
    });

    const cleanup = () => {
        customerSocket.close();
        customerTracking.close();
        partnerTracking.close();
    };

    try {
        await new Promise<void>((resolve) => {
            customerTracking.on("connect", () => {
                console.log("✅ Customer Connected to /tracking");
                resolve();
            });
        });

        await new Promise<void>((resolve) => {
            partnerTracking.on("connect", () => {
                console.log("✅ Partner Connected to /tracking");
                resolve();
            });
        });

        // 3. Customer Joins Room
        console.log(`Customer joining room: delivery_${DELIVERY_ID}`);
        customerTracking.emit("join_room", `delivery_${DELIVERY_ID}`);

        // Wait a bit for join to process
        await new Promise(r => setTimeout(r, 500));

        // 4. Setup Listener and Emit Update
        const locationPromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timeout waiting for location update"));
            }, 5000);

            customerTracking.on("location_update", (data) => {
                clearTimeout(timeout);
                console.log("✅ Received Location Update:", data);
                if (data.lat === 12.9716 && data.lng === 77.5946) {
                    console.log("✅ Data matches sent coordinates");
                    resolve();
                } else {
                    reject(new Error("Data mismatch"));
                }
            });
        });

        // 5. Partner Emits Update
        console.log("Partner emitting location update...");
        partnerTracking.emit("update_location", {
            deliveryId: DELIVERY_ID,
            partnerId: PARTNER_ID,
            lat: 12.9716,
            lng: 77.5946,
            speed: 10,
            heading: 90
        });

        await locationPromise;
        console.log("--- VERIFICATION SUCCESS ---");

    } catch (err) {
        console.error("❌ VERIFICATION FAILED:", err);
        process.exit(1);
    } finally {
        cleanup();
        process.exit(0);
    }
}

verifyTracking();
