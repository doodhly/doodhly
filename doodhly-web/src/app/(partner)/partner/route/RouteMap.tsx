"use client";

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RunSheetItem } from '@/lib/deliveries';

interface RouteMapProps {
    deliveries: RunSheetItem[];
}

// Fix for Leaflet marker icons in Next.js
const initLeaflet = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
};

function FitBounds({ deliveries }: { deliveries: RunSheetItem[] }) {
    const map = useMap();

    useEffect(() => {
        const points = (deliveries || [])
            .map(d => [parseFloat(String(d.lat)), parseFloat(String(d.lng))] as [number, number])
            .filter(p => !isNaN(p[0]) && !isNaN(p[1]));

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [deliveries, map]);

    return null;
}

const createNumberIcon = (number: number, status: string) => {
    const isDelivered = status === 'DELIVERED';
    return L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg font-black text-xs ${isDelivered ? 'bg-green-500 text-white' : 'bg-brand-blue text-white'}">${number}</div>`,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

export default function RouteMap({ deliveries }: RouteMapProps) {
    useEffect(() => {
        initLeaflet();
    }, []);

    const validPoints = (deliveries || [])
        .filter(d => {
            const lat = parseFloat(String(d.lat));
            const lng = parseFloat(String(d.lng));
            return !isNaN(lat) && !isNaN(lng);
        })
        .sort((a, b) => a.sequence - b.sequence);

    const polylinePositions = validPoints.map(d => [parseFloat(String(d.lat)), parseFloat(String(d.lng))] as [number, number]);

    return (
        <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
            <MapContainer
                center={[21.871, 82.852]} // Fallback center
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <Polyline
                    positions={polylinePositions}
                    pathOptions={{
                        color: '#2563eb',
                        weight: 4,
                        opacity: 0.6,
                        dashArray: '10, 10'
                    }}
                />

                {validPoints.map((delivery) => (
                    <Marker
                        key={delivery.id}
                        position={[parseFloat(String(delivery.lat)), parseFloat(String(delivery.lng))]}
                        icon={createNumberIcon(delivery.sequence, delivery.status)}
                    >
                    </Marker>
                ))}

                <FitBounds deliveries={deliveries} />
            </MapContainer>

            <div className="absolute bottom-4 right-4 z-[1000] bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                <p className="text-[10px] text-white font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
                    {validPoints.length} Stops Tracked
                </p>
            </div>
        </div>
    );
}
