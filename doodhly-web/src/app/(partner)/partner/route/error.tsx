"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function PartnerRouteError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Partner Route Error:", error);
    }, [error]);

    return (
        <div className="h-full flex items-center justify-center p-6 text-center">
            <div className="space-y-4 max-w-xs">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-white font-bold text-lg">Unable to load route</h3>
                <p className="text-slate-500 text-xs">{error.message || "Something went wrong loading the map view."}</p>
                <button
                    onClick={() => reset()}
                    className="w-full py-3 bg-brand-blue rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-colors"
                >
                    <RefreshCcw size={16} />
                    Retry
                </button>
            </div>
        </div>
    );
}
