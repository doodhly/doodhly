
"use client";

import { useEffect, useState, useRef } from "react";
import { getSocket } from "@/lib/socket"; // Keep this
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"; // Remove react-leaflet components
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet Icon issue in Next.js
const icon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3721/3721619.png", // Milk Truck Icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

interface Location {
    lat: number;
    lng: number;
    speed?: number;
    timestamp: number;
}

// Helper component removed in favor of direct map ref control

export default function LiveTrackingMap({ deliveryId }: { deliveryId: number }) {
    const [trackingData, setTrackingData] = useState<{
        partnerLocation: Location | null;
        eta: string;
    }>({
        partnerLocation: null,
        eta: "Calculating...",
    });
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const isInitializing = useRef(false); // NEW: Prevent race conditions

    const targetLocationRef = useRef<Location | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        socket.emit("join_room", `delivery_${deliveryId}`);

        socket.on("location_update", (data: any) => {
            console.log("Received location update:", data);
            const newLocation = {
                lat: data.lat,
                lng: data.lng,
                speed: data.speed,
                timestamp: Date.now()
            };

            targetLocationRef.current = newLocation;
            setTrackingData(prev => ({
                ...prev,
                partnerLocation: newLocation,
                eta: data.speed && data.speed > 0 ? "~5 mins away" : "Partner stationary",
            }));
        });

        return () => {
            socket.emit("leave_room", `delivery_${deliveryId}`);
            socket.off("location_update");
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            socket.disconnect();
        };
    }, [deliveryId]);

    // ... (map init useEffect remains same)

    useEffect(() => {
        if (!trackingData.partnerLocation || !mapRef.current) return;

        const map = mapRef.current;
        let marker = (map as any)._partnerMarker as L.Marker | undefined;

        if (!marker) {
            marker = L.marker([trackingData.partnerLocation.lat, trackingData.partnerLocation.lng], { icon }).addTo(map);
            (map as any)._partnerMarker = marker;
            map.setView([trackingData.partnerLocation.lat, trackingData.partnerLocation.lng], 15);
        }

        const animate = () => {
            if (!targetLocationRef.current || !marker) return;

            const currentLatLng = marker.getLatLng();
            const targetLat = targetLocationRef.current.lat;
            const targetLng = targetLocationRef.current.lng;

            // Simple linear interpolation (LERP)
            const deltaLat = targetLat - currentLatLng.lat;
            const deltaLng = targetLng - currentLatLng.lng;

            // If we are very close, just set it and stop
            if (Math.abs(deltaLat) < 0.00001 && Math.abs(deltaLng) < 0.00001) {
                marker.setLatLng([targetLat, targetLng]);
                return;
            }

            // Move 5% of the distance each frame for smoothness
            const nextLat = currentLatLng.lat + deltaLat * 0.05;
            const nextLng = currentLatLng.lng + deltaLng * 0.05;

            marker.setLatLng([nextLat, nextLng]);
            map.panTo([nextLat, nextLng], { animate: true, duration: 0.1 });

            const speedKmh = targetLocationRef.current.speed ? (targetLocationRef.current.speed * 3.6).toFixed(1) : '0';
            marker.bindPopup(`Your milk is here! <br /> Speed: ${speedKmh} km/h`);

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animate();

    }, [trackingData.partnerLocation]);

    if (!trackingData.partnerLocation) {
        return (
            <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                Waiting for partner location...
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider animate-pulse">● Live Delivery</span>
                <span className="text-xs font-bold text-gray-700">{trackingData.eta}</span>
            </div>
            <div className="h-64 rounded-xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
                <div ref={mapContainerRef} style={{ height: "100%", width: "100%", zIndex: 0 }} />
            </div>
        </div>
    );
}
