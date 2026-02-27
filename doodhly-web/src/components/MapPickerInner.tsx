"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Navigation, Focus } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerInnerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number, accuracy: number | null) => void;
    accuracy?: number | null;
}

export default function MapPickerInner({ initialLat, initialLng, onLocationSelect, accuracy }: MapPickerInnerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const isInitializing = useRef(false); // CRITICAL: Prevent race conditions
    const isUserInteracting = useRef(false);
    const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

    // Initial positioning
    const defaultCenter: [number, number] = [initialLat || 21.871, initialLng || 82.852];

    // Initialize map once on mount
    useEffect(() => {
        // Multi-level guards to prevent double initialization
        if (!mapContainerRef.current) return;
        if (mapRef.current) return;
        if (isInitializing.current) return;
        if ((mapContainerRef.current as any)._leaflet_id) return;

        isInitializing.current = true;

        try {
            // Fix for Leaflet marker icons in Next.js
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            // Create map
            const map = L.map(mapContainerRef.current, {
                center: defaultCenter,
                zoom: 16,
                zoomControl: false,
            });

            // Add tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            }).addTo(map);

            // Store map reference
            mapRef.current = map;

            // Add map event handlers
            map.on('movestart', () => {
                isUserInteracting.current = true;
                if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
            });

            map.on('moveend', () => {
                const center = map.getCenter();
                onLocationSelect(center.lat, center.lng, null); // Manual drag drops accuracy context

                // Resume GPS following after 5 seconds of inactivity
                if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
                interactionTimeout.current = setTimeout(() => {
                    isUserInteracting.current = false;
                }, 5000);
            });

            console.log('MapPicker initialized successfully');

        } catch (error) {
            console.error("Map initialization failed:", error);
            isInitializing.current = false;
        }

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                console.log('Cleaning up MapPicker instance');
                mapRef.current.off(); // Remove all event listeners
                mapRef.current.remove();
                mapRef.current = null;
            }
            if (markerRef.current) {
                markerRef.current = null;
            }
            if (interactionTimeout.current) {
                clearTimeout(interactionTimeout.current);
            }
            isInitializing.current = false;
        };
    }, []); // Run only once on mount

    // Update center when coordinates change (if not user interacting)
    useEffect(() => {
        if (!mapRef.current || !initialLat || !initialLng) return;
        if (isUserInteracting.current) return;

        mapRef.current.flyTo([initialLat, initialLng], 16, {
            animate: true,
            duration: 1.5
        });
    }, [initialLat, initialLng]);

    // Handle recenter button
    const handleRecenter = useCallback(() => {
        if (!mapRef.current || !initialLat || !initialLng) return;

        isUserInteracting.current = false;
        mapRef.current.flyTo([initialLat, initialLng], 18, { animate: true });
    }, [initialLat, initialLng]);

    return (
        <div className="relative h-72 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-inner group">
            {/* Map Container */}
            <div
                ref={mapContainerRef}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                className="rounded-3xl"
            />

            {/* Recenter Control */}
            {initialLat && (
                <div className="absolute top-4 right-4 z-[1000]">
                    <button
                        onClick={handleRecenter}
                        className="p-3 bg-white hover:bg-slate-50 text-brand-blue rounded-2xl shadow-lg border border-slate-100 transition-all active:scale-95"
                        title="Snap map to my location"
                    >
                        <Focus size={20} />
                    </button>
                </div>
            )}

            {/* Target Crosshair / Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[1000] mb-2 bounce-in">
                <div className="relative group-active:scale-110 transition-transform origin-bottom duration-300">
                    <MapPin className="text-brand-blue fill-brand-blue/20 drop-shadow-2xl" size={48} strokeWidth={2.5} />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black/40 rounded-full blur-[2px]" />
                </div>
            </div>

            {/* Float Menu (Accuracy) */}
            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-none">
                {accuracy && (
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black text-brand-blue border border-brand-blue/20 flex items-center gap-1.5 shadow-sm">
                        <Navigation size={10} className={accuracy > 50 ? "animate-spin" : "animate-pulse"} />
                        {accuracy > 50 ? "REFINING GPS..." : "PINPOINT ACCURACY"} ({Math.round(accuracy)}m)
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 left-1/ 1/2 -translate-x-1/2 z-[1000] pointer-events-none w-full px-6">
                <p className="bg-black/60 backdrop-blur text-white text-[10px] px-4 py-2 rounded-full font-bold uppercase tracking-widest text-center shadow-lg mx-auto w-fit border border-white/10">
                    Slide map to place pin exactly
                </p>
            </div>
        </div>
    );
}
