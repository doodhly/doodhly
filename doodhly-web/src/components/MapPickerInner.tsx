"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Focus } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerInnerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number, accuracy: number | null) => void;
    accuracy?: number | null;
}

// Internal component to handle map events
function MapEventsHandler({
    onMoveEnd,
    onMoveStart
}: {
    onMoveEnd: (lat: number, lng: number) => void;
    onMoveStart: () => void
}) {
    const map = useMapEvents({
        movestart: () => {
            onMoveStart();
        },
        moveend: () => {
            const center = map.getCenter();
            onMoveEnd(center.lat, center.lng);
        }
    });
    return null;
}

export default function MapPickerInner({ initialLat, initialLng, onLocationSelect, accuracy }: MapPickerInnerProps) {
    const mapRef = useRef<L.Map | null>(null);
    const isUserInteracting = useRef(false);
    const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

    // Initial positioning
    const defaultCenter: [number, number] = [initialLat || 21.871, initialLng || 82.852];

    useEffect(() => {
        // Fix for Leaflet marker icons in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    // programmatic update from GPS (parents)
    useEffect(() => {
        if (mapRef.current && initialLat && initialLng && !isUserInteracting.current) {
            mapRef.current.flyTo([initialLat, initialLng], mapRef.current.getZoom(), {
                animate: true,
                duration: 1.5
            });
        }
    }, [initialLat, initialLng]);

    const handleMoveStart = useCallback(() => {
        isUserInteracting.current = true;
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    }, []);

    const handleMoveEnd = useCallback((lat: number, lng: number) => {
        onLocationSelect(lat, lng, null); // Manual drag drops accuracy context

        // Resume GPS following after 5 seconds of inactivity
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
        interactionTimeout.current = setTimeout(() => {
            isUserInteracting.current = false;
        }, 5000);
    }, [onLocationSelect]);

    const recenter = () => {
        if (mapRef.current && initialLat && initialLng) {
            isUserInteracting.current = false;
            mapRef.current.flyTo([initialLat, initialLng], 18);
        }
    };

    return (
        <div className="relative h-72 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-inner group">
            <MapContainer
                center={defaultCenter}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                ref={(map) => { mapRef.current = map; }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
                <MapEventsHandler onMoveEnd={handleMoveEnd} onMoveStart={handleMoveStart} />
            </MapContainer>

            {/* Target Crosshair / Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[1000] mb-2 bounce-in">
                <div className="relative group-active:scale-110 transition-transform origin-bottom duration-300">
                    <MapPin className="text-brand-blue fill-brand-blue/20 drop-shadow-2xl" size={48} strokeWidth={2.5} />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black/40 rounded-full blur-[2px]" />
                </div>
            </div>

            {/* Float Menu */}
            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                {accuracy && (
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black text-brand-blue border border-brand-blue/20 flex items-center gap-1.5 shadow-sm">
                        <Navigation size={10} className={accuracy > 50 ? "animate-spin" : "animate-pulse"} />
                        {accuracy > 50 ? "REFINING GPS..." : "PINPOINT ACCURACY"} ({Math.round(accuracy)}m)
                    </div>
                )}
            </div>

            <div className="absolute top-4 right-4 z-[1000]">
                {initialLat && (
                    <button
                        onClick={recenter}
                        className="p-3 bg-white hover:bg-slate-50 text-brand-blue rounded-2xl shadow-lg border border-slate-100 transition-all active:scale-95"
                        title="Snap map to my location"
                    >
                        <Focus size={20} />
                    </button>
                )}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none w-full px-6">
                <p className="bg-black/60 backdrop-blur text-white text-[10px] px-4 py-2 rounded-full font-bold uppercase tracking-widest text-center shadow-lg mx-auto w-fit border border-white/10">
                    Slide map to place pin exactly
                </p>
            </div>
        </div>
    );
}
