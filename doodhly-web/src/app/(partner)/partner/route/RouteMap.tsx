"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RunSheetItem } from '@/lib/deliveries';

interface RouteMapProps {
    deliveries: RunSheetItem[];
}

export default function RouteMap({ deliveries }: RouteMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const iconsInitialized = useRef(false);
    const isInitializing = useRef(false); // NEW: Prevent race conditions

    useEffect(() => {
        // 1. Initialize Leaflet Global Icons (once)
        if (!iconsInitialized.current) {
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
            iconsInitialized.current = true;
        }

        // 2. Map Initialization with multi-level guards
        if (!mapContainerRef.current) return;
        if (mapRef.current) return;
        if (isInitializing.current) return;
        if ((mapContainerRef.current as any)._leaflet_id) return;

        isInitializing.current = true;

        try {
            const mapInstance = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([21.871, 82.852], 13);

            mapRef.current = mapInstance;

            L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(mapInstance);

            // Cleanup on unmount
            return () => {
                if (mapInstance) {
                    mapInstance.remove();
                    mapRef.current = null;
                }
                isInitializing.current = false;
            };
        } catch (error) {
            console.error("Map initialization failed:", error);
            isInitializing.current = false;
        }
    }, []);

    // 3. Update Markers & Polyline when deliveries change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing layers (except tile layer)
        // A simple way is to remove all layers and re-add tile layer, OR keep track of layer group.
        // Let's use a LayerGroup for content.

        // Actually, let's just clear everything that is NOT a tile layer, or simpler: use a FeatureGroup.
        // But for simplicity in this imperative style:
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

        const validPoints = (deliveries || [])
            .filter(d => {
                const lat = parseFloat(String(d.lat));
                const lng = parseFloat(String(d.lng));
                return !isNaN(lat) && !isNaN(lng);
            })
            .sort((a, b) => a.sequence - b.sequence);

        if (validPoints.length === 0) return;

        // Add Polyline
        const latLngs = validPoints.map(d => [parseFloat(String(d.lat)), parseFloat(String(d.lng))] as [number, number]);

        L.polyline(latLngs, {
            color: '#2563eb',
            weight: 4,
            opacity: 0.6,
            dashArray: '10, 10'
        }).addTo(map);

        // Add Markers
        validPoints.forEach(d => {
            const isDelivered = d.status === 'DELIVERED';
            const icon = L.divIcon({
                html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg font-black text-xs ${isDelivered ? 'bg-green-500 text-white' : 'bg-brand-blue text-white'}">${d.sequence}</div>`,
                className: 'custom-div-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            L.marker([parseFloat(String(d.lat)), parseFloat(String(d.lng))], { icon }).addTo(map);
        });

        // Fit Bounds
        if (latLngs.length > 0) {
            const bounds = L.latLngBounds(latLngs);
            map.fitBounds(bounds, { padding: [40, 40] });
        }

    }, [deliveries]);

    return (
        <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
            <div ref={mapContainerRef} style={{ height: "100%", width: "100%", zIndex: 0 }} />

            <div className="absolute bottom-4 right-4 z-[1000] bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                <p className="text-[10px] text-white font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
                    {deliveries?.length || 0} Stops Tracked
                </p>
            </div>
        </div>
    );
}
