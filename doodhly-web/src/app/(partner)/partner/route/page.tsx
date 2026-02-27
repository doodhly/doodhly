"use client";

import { useEffect, useState } from "react";
import { syncRunSheet, RunSheetItem, optimizeRoute } from "@/lib/deliveries";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MapPin, Navigation, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import dynamic from "next/dynamic";
import { Container } from "@/components/ui/Container";

const RouteMap = dynamic(() => import("./RouteMap"), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-900 animate-pulse rounded-2xl border border-white/5 flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest">Initialising Fleet View...</div>
});

import LocationTracker from "@/components/partner/LocationTracker";

export default function PartnerRoutePage() {
    const [deliveries, setDeliveries] = useState<RunSheetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { isOnline, pendingCount } = useOfflineSync();
    const { logout } = useAuth();

    const fetchRoute = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await syncRunSheet();
            const list = Array.isArray(data.deliveries) ? data.deliveries : [];
            setDeliveries(list);
            // Also save to local storage as "current_route" for offline view
            localStorage.setItem("current_route", JSON.stringify(list));
        } catch (err: any) {
            console.error("Failed to sync route", err);
            const msg = err?.data?.message || err?.message || "Failed to load route";
            setError(msg);
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

    const handleOptimize = async () => {
        try {
            setLoading(true);
            const { optimizedRoute, savings } = await optimizeRoute(deliveries);
            setDeliveries(optimizedRoute);
            // In a real app, we'd persist this new order to the backend
            alert(`Route Optimized! \nEst. Savings: ${savings.distance} / ${savings.time}`);
        } catch (err) {
            console.error("Optimization failed", err);
            alert("Failed to optimize route");
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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <LazyMotion features={domAnimation}>
        <div className="pb-20 min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/20 blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-full h-96 bg-indigo-900/10 blur-[100px]" />
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 p-2 text-center text-xs font-bold relative z-50">
                    {error}
                </div>
            )}

            {/* Offline Status Banner */}
            {!isOnline && (
                <div className="bg-red-600 text-white text-[10px] p-2 text-center font-black uppercase tracking-tighter sticky top-0 z-[2000] backdrop-blur-md shadow-lg shadow-red-900/50">
                    Offline Mode • {pendingCount} actions pending
                </div>
            )}

            <Container className="p-4 space-y-6 relative z-10 pt-8">
                <header className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">Daily Run</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ">
                                    {deliveries?.length > 0 ? deliveries.filter((d: RunSheetItem) => d.status === 'PENDING').length : 0} Remaining / {deliveries?.length || 0} Total
                                </p>
                                <button
                                    onClick={fetchRoute}
                                    disabled={loading}
                                    className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-[9px] font-black uppercase hover:bg-blue-500/20 transition-all"
                                >
                                    {loading ? 'Syncing...' : 'Refresh'}
                                </button>
                                <button
                                    onClick={handleOptimize}
                                    disabled={loading || deliveries.length < 2}
                                    className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-[9px] font-black uppercase hover:bg-emerald-500/20 transition-all"
                                >
                                    Optimize
                                </button>
                            </div>
                        </div>
                        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') logout(); }} className="h-10 w-10 rounded-full bg-slate-900/50 border border-white/10 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-all group shadow-lg" onClick={() => logout()}>
                            <div className="h-2 w-2 bg-red-500 rounded-full group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                        <RouteMap deliveries={deliveries} />
                    </div>

                    {/* Live Tracking Control */}
                    {deliveries.find((d: RunSheetItem) => d.status === 'PENDING') && (
                        <LocationTracker
                            deliveryId={Number(deliveries.find((d: RunSheetItem) => d.status === 'PENDING')?.id || 0)}
                        />
                    )}
                </header>

                <m.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                >
                    {(!deliveries || deliveries.length === 0) && !loading && (
                        <div className="text-center p-12 bg-slate-900/40 rounded-3xl border border-dashed border-white/5 backdrop-blur-sm">
                            <Navigation className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold text-sm tracking-tight">No drops scheduled for today.</p>
                        </div>
                    )}

                    {deliveries?.length > 0 && [...deliveries].sort((a: RunSheetItem, b: RunSheetItem) => a.sequence - b.sequence).map((delivery: RunSheetItem) => (
                        <m.div variants={item} key={delivery.id}>
                            <Link
                                href={`/partner/delivery/${delivery.id}`}
                                className="block group active:scale-[0.98] transition-all"
                            >
                                <div className={cn(
                                    "p-4 rounded-3xl flex items-center gap-4 border transition-all duration-300 relative overflow-hidden",
                                    delivery.status === "PENDING"
                                        ? "bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-lg shadow-black/20 hover:bg-slate-800/60 hover:border-white/20"
                                        : "bg-slate-950/30 border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-80"
                                )}>
                                    {/* Sequence Number */}
                                    <div className={cn(
                                        "h-12 w-12 shrink-0 rounded-2xl flex flex-col items-center justify-center border relative z-10",
                                        delivery.status === "DELIVERED"
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                    )}>
                                        <span className="text-[10px] font-black opacity-40 leading-none">#</span>
                                        <span className="text-xl font-black leading-none">{delivery.sequence}</span>
                                    </div>

                                    <div className="flex-1 overflow-hidden relative z-10">
                                        <h3 className="font-black text-white truncate text-lg tracking-tight group-hover:text-blue-200 transition-colors">
                                            {delivery.customerName}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <MapPin className="w-3 h-3 text-slate-500" />
                                            <p className="text-xs text-slate-400 font-bold truncate">{delivery.address}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-wide">
                                                {delivery.productName} <span className="text-slate-500">x</span> {delivery.quantity}
                                            </div>
                                            {delivery.status === "DELIVERED" && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                                    <CheckCircle2 size={12} /> Done
                                                </div>
                                            )}
                                            {delivery.status === "MISSED" && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                                    <AlertCircle size={12} /> Missed
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Nav Button */}
                                    {delivery.status === "PENDING" && (
                                        <button
                                            onClick={(e) => handleNavigate(e, delivery.lat, delivery.lng)}
                                            className="h-10 w-10 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-xl flex items-center justify-center transition-all border border-white/5 relative z-20 group/nav"
                                        >
                                            <Navigation className="text-slate-400 group-hover/nav:text-blue-400 transition-colors" size={18} />
                                        </button>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                                </div>
                            </Link>
                        </m.div>
                    ))}
                </m.div>
            </Container>
        </div>
        </LazyMotion>
    );
}
