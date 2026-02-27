"use client";

import { useEffect, useState } from "react";
import { getQueue, removeFromQueue, OfflineAction } from "@/lib/offline-queue";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

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

        console.log(`Processing ${queue.length} offline actions in batch...`);

        // Format for batch endpoint
        const updates = queue.map((action) => ({
            id: action.deliveryId,
            type: action.type,
            code: action.payload?.code,
            reason: action.payload?.reason,
            timestamp: action.timestamp
        }));

        try {
            const res = await api.post<{ results: any[] }>(`${API_ENDPOINTS.DELIVERY_SYNC}/batch`, { updates });

            // Clear successfully processed items from queue
            res.results.forEach((result) => {
                if (result.success || result.status === 'ALREADY_DONE') {
                    // Find original action ID to remove from queue
                    const originalAction = queue.find(q => q.deliveryId === result.id);
                    if (originalAction) {
                        removeFromQueue(originalAction.id);
                    }
                } else {
                    console.error("Failed to process item in batch:", result);
                }
            });
        } catch (err) {
            console.error("Batch sync failed. Retrying later.", err);
        } finally {
            setPendingCount(getQueue().length);
        }
    };

    return { isOnline, pendingCount, processQueue };
}
