
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Loader2, Navigation } from "lucide-react";

export default function LocationTracker({ deliveryId }: { deliveryId: number }) {
    const { user } = useAuth();
    const [tracking, setTracking] = useState(false);
    const [status, setStatus] = useState<string>("Ready");
    const [watchId, setWatchId] = useState<number | null>(null);

    const toggleTracking = () => {
        if (tracking) {
            stopTracking();
        } else {
            startTracking();
        }
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            setStatus("Geolocation not supported");
            return;
        }

        const socket = getSocket();
        socket.connect();

        // Join partner room (optional, for admin tracking)
        if (user?.id) {
            socket.emit("join_room", `partner_${user.id}`);
        }

        setStatus("Tracking active...");
        setTracking(true);

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, speed, heading } = position.coords;

                socket.emit("update_location", {
                    deliveryId, // In real app, this might be the current active delivery or route ID
                    partnerId: user?.id,
                    lat: latitude,
                    lng: longitude,
                    speed,
                    heading
                });

                setStatus(`Broadcasting: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            },
            (error) => {
                console.error("Location error:", error);
                setStatus(`Error: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        setWatchId(id);
    };

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }

        const socket = getSocket();
        socket.disconnect(); // Or just stop emitting

        setTracking(false);
        setStatus("Tracking stopped");
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        }
    }, [watchId]);

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Navigation className={`w-5 h-5 ${tracking ? "text-green-600 animate-pulse" : "text-gray-400"}`} />
                    <span className="font-bold text-gray-800">Live Tracking</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${tracking ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {tracking ? "ON AIR" : "OFFLINE"}
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-4 h-5 truncate">{status}</p>

            <Button
                onClick={toggleTracking}
                className={`w-full ${tracking ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-brand-blue text-white"}`}
            >
                {tracking ? "Stop Sharing Location" : "Start Sharing Location"}
            </Button>
        </div>
    );
}
