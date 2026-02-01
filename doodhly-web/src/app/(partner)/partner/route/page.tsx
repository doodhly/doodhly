"use client";

import { useEffect, useState } from "react";
import { syncRunSheet, RunSheetItem } from "@/lib/deliveries";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MapPin, Navigation, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("./RouteMap"), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-900 animate-pulse rounded-2xl border border-white/5 flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest">Initialising Fleet View...</div>
});

export default function PartnerRoutePage() {
    const [deliveries, setDeliveries] = useState<RunSheetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOnline, pendingCount } = useOfflineSync();

    const fetchRoute = async () => {
        try {
            setLoading(true);
            const data = await syncRunSheet();
            const list = Array.isArray(data.deliveries) ? data.deliveries : [];
            setDeliveries(list);
            // Also save to local storage as "current_route" for offline view
            localStorage.setItem("current_route", JSON.stringify(list));
        } catch (err) {
            console.error("Failed to sync route", err);
            // Fallback to local storage
            const cached = localStorage.getItem("current_route");
            if (cached) {
                const parsed = JSON.parse(cached);
                setDeliveries(Array.isArray(parsed) ? parsed : []);
            } else {
                setDeliveries([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoute();

        // Auto-refresh every 60 seconds if online
        const timer = setInterval(() => {
            if (isOnline) fetchRoute();
        }, 60000);

        return () => clearInterval(timer);
    }, [isOnline]);
    const handleNavigate = (e: React.MouseEvent, lat?: number, lng?: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
        } else {
            alert("No coordinates for this address");
        }
    };

    return (
        <div className="pb-20 bg-black min-h-screen text-slate-200">
            {/* Offline Status Banner */}
            {!isOnline && (
                <div className="bg-red-600 text-white text-[10px] p-2 text-center font-black uppercase tracking-tighter sticky top-0 z-[2000] backdrop-blur-md">
                    Offline Mode • {pendingCount} actions pending
                </div>
            )}

            <div className="p-4 space-y-6">
                <header className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-white tracking-tighter">Daily Run</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest ">
                                    {deliveries?.length > 0 ? deliveries.filter((d: RunSheetItem) => d.status === 'PENDING').length : 0} Remaining / {deliveries?.length || 0} Total
                                </p>
                                <button
                                    onClick={fetchRoute}
                                    disabled={loading}
                                    className="px-2 py-0.5 bg-brand-blue/10 rounded text-brand-blue text-[9px] font-black uppercase hover:bg-brand-blue/20 transition-colors"
                                >
                                    {loading ? 'Syncing...' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                            <Navigation className="text-brand-blue" size={18} />
                        </div>
                    </div>

                    <RouteMap deliveries={deliveries} />
                </header>

                <div className="space-y-3">
                    {(!deliveries || deliveries.length === 0) && !loading && (
                        <div className="text-center p-12 bg-slate-900/40 rounded-3xl border border-dashed border-white/5">
                            <p className="text-slate-500 font-bold text-sm tracking-tight">No drops scheduled for today.</p>
                        </div>
                    )}

                    {deliveries?.length > 0 && [...deliveries].sort((a: RunSheetItem, b: RunSheetItem) => a.sequence - b.sequence).map((delivery: RunSheetItem) => (
                        <Link
                            key={delivery.id}
                            href={`/partner/delivery/${delivery.id}`}
                            className="block"
                        >
                            <div className={cn(
                                "p-4 rounded-3xl flex items-center gap-4 border transition-all duration-300 active:scale-[0.97]",
                                delivery.status === "PENDING"
                                    ? "bg-slate-900/80 border-white/10 shadow-2xl"
                                    : "bg-slate-950/50 border-white/5 opacity-50"
                            )}>
                                {/* Sequence Number */}
                                <div className={cn(
                                    "h-12 w-12 shrink-0 rounded-2xl flex flex-col items-center justify-center border",
                                    delivery.status === "DELIVERED"
                                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                                        : "bg-brand-blue/10 border-brand-blue/20 text-brand-blue"
                                )}>
                                    <span className="text-[10px] font-black opacity-40 leading-none">#</span>
                                    <span className="text-xl font-black leading-none">{delivery.sequence}</span>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-black text-white truncate text-base tracking-tight">{delivery.customerName}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <p className="text-[11px] text-slate-500 font-bold truncate">{delivery.address}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-black uppercase">
                                            {delivery.productName} ({delivery.quantity})
                                        </div>
                                        {delivery.status === "DELIVERED" && <CheckCircle2 size={12} className="text-green-500" />}
                                        {delivery.status === "MISSED" && <AlertCircle size={12} className="text-red-500" />}
                                    </div>
                                </div>

                                {/* Quick Nav */}
                                {delivery.status === "PENDING" && (
                                    <button
                                        onClick={(e) => handleNavigate(e, delivery.lat, delivery.lng)}
                                        className="h-12 w-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-colors border border-white/5 group"
                                    >
                                        <MapPin className="text-slate-400 group-hover:text-red-500 transition-colors" size={20} />
                                    </button>
                                )}
                                <ChevronRight className="text-slate-700" size={16} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
