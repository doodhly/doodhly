"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic import of the inner component that contains Leaflet logic
// This ensures window dependencies and hooks are only ever instantiated on the client.
const MapPickerInner = dynamic(() => import('./MapPickerInner'), {
    ssr: false,
    loading: () => (
        <div className="h-72 bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            Initializing Premium Map...
        </div>
    )
});

interface MapPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number, accuracy: number | null) => void;
    accuracy?: number | null;
}

export default function MapPicker(props: MapPickerProps) {
    return <MapPickerInner {...props} />;
}
