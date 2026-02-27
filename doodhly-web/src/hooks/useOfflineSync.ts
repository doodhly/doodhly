"use client";

import { useEffect, useState } from "react";
import { getQueue, removeFromQueue, OfflineAction } from "@/lib/offline-queue";
import { verifyDelivery, reportIssue } from "@/lib/deliveries";
import { toast } from "sonner"; // Assuming sonner or generic toast

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Initial check
        setIsOnline(navigator.onLine);
        setPendingCount(getQueue().length);

        const handleOnline = () => {
            setIsOnline(true);
            processQueue();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const processQueue = async () => {
        const queue = getQueue();
        if (queue.length === 0) return;

        console.log(`Processing ${queue.length} offline actions...`);

        for (const action of queue) {
            try {
                if (action.type === "VERIFY") {
                    await verifyDelivery(action.deliveryId, action.payload.code, action.payload.coords);
                } else if (action.type === "REPORT") {
                    await reportIssue(action.deliveryId, action.payload.reason);
                }
                removeFromQueue(action.id);
            } catch (err) {
                console.error("Failed to sync action", action, err);
                // Keep in queue if it's a network error, remove if 4xx? 
                // For simplicity in Sprint 2, we retry forever on network error.
            }
        }
        setPendingCount(getQueue().length);
        // toast.success("Offline actions synced!");
    };

    return { isOnline, pendingCount, processQueue };
}
