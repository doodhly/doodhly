"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { syncRunSheet, RunSheetItem } from "@/lib/deliveries";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { BrutalStat } from "@/components/brutal/BrutalStat";
import { MapPin, Navigation, Wifi, WifiOff, AlertTriangle, Clock, ArrowRight } from "lucide-react";

export default function PartnerDashboard() {
    const { user } = useAuth();
    const { isOnline, pendingCount } = useOfflineSync();
    const [routeData, setRouteData] = useState<{
        deliveries: RunSheetItem[];
        stats: { total: number; completed: number; pending: number; missed: number; progress: number };
        loading: boolean;
    }>({
        deliveries: [],
        stats: { total: 0, completed: 0, pending: 0, missed: 0, progress: 0 },
        loading: true,
    });

    useEffect(() => {
        const fetchRouteData = async () => {
            try {
                const data = await syncRunSheet();
                const list = Array.isArray(data.deliveries) ? data.deliveries : [];

                const total = list.length;
                const completed = list.filter(d => d.status === 'DELIVERED').length;
                const missed = list.filter(d => d.status === 'MISSED').length;
                const pending = list.filter(d => d.status === 'PENDING').length;
                const done = completed + missed;
                const progress = total > 0 ? Math.round((done / total) * 100) : 0;

                setRouteData(prev => ({
                    ...prev,
                    deliveries: list,
                    stats: { total, completed, pending, missed, progress },
                    loading: false,
                }));
            } catch (err) {
                console.error("Dashboard sync failed", err);
                let fallbackDeliveries: RunSheetItem[] = [];
                let fallbackStats = { total: 0, completed: 0, pending: 0, missed: 0, progress: 0 };
                const cached = localStorage.getItem("current_route");
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed)) {
                        fallbackDeliveries = parsed;
                        const total = parsed.length;
                        const completed = parsed.filter((d: any) => d.status === 'DELIVERED').length;
                        const missed = parsed.filter((d: any) => d.status === 'MISSED').length;
                        const pending = parsed.filter((d: any) => d.status === 'PENDING').length;
                        const done = completed + missed;
                        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                        fallbackStats = { total, completed, pending, missed, progress };
                    }
                }
                setRouteData(prev => ({
                    ...prev,
                    deliveries: fallbackDeliveries,
                    stats: fallbackStats,
                    loading: false,
                }));
            }
        };

        fetchRouteData();
    }, []);

    if (routeData.loading) return <div className="min-h-screen flex items-center justify-center font-black text-4xl bg-brutal-bg uppercase">LOADING ROUTE...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b-4 border-black pb-8">
                <div>
                    <div className="inline-flex items-center gap-2 font-mono font-bold text-xs uppercase bg-brutal-yellow border-2 border-black px-2 py-1 mb-2 transform -rotate-1">
                        <MapPin className="w-3 h-3" />
                        {user?.default_city_id || "Sakti, CG"}
                    </div>
                    <h1 className="font-sans font-black text-5xl md:text-7xl uppercase leading-[0.9]">
                        Partner<br />Hub.
                    </h1>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 border-4 border-black font-mono font-bold text-sm uppercase shadow-[4px_4px_0px_#000] ${isOnline ? 'bg-success text-black' : 'bg-black text-white'}`}>
                        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        {isOnline ? "ONLINE" : "OFFLINE"}
                    </div>
                    {pendingCount > 0 && (
                        <div className="bg-brutal-orange border-2 border-black px-2 py-1 text-xs font-bold uppercase">
                            {pendingCount} PENDING SYNCS
                        </div>
                    )}
                </div>
            </div>

            {/* Route Card */}
            {routeData.stats.total === 0 ? (
                <div className="text-center p-12 border-4 border-dashed border-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-sans font-black text-2xl text-gray-400 uppercase">No Route Assigned</h3>
                    <p className="font-mono text-sm text-gray-500 mt-2">Check back later, captain.</p>
                </div>
            ) : (
                <BrutalCard className="border-4 shadow-[8px_8px_0px_#000] p-8">
                    <h2 className="font-sans font-black text-4xl uppercase mb-6">Today's Grind</h2>

                    <div className="mb-8">
                        <div className="flex justify-between font-mono font-bold mb-2">
                            <span>PROGRESS</span>
                            <span>{routeData.stats.progress}%</span>
                        </div>
                        <div className="h-8 border-4 border-black bg-white p-1">
                            <div
                                className="h-full bg-brutal-primary transition-all duration-300"
                                style={{ width: `${routeData.stats.progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="text-center border-2 border-black p-4 bg-gray-100">
                            <div className="text-3xl font-black">{routeData.stats.total}</div>
                            <div className="text-xs font-mono font-bold text-gray-500 uppercase">Total</div>
                        </div>
                        <div className="text-center border-2 border-black p-4 bg-green-100">
                            <div className="text-3xl font-black">{routeData.stats.completed}</div>
                            <div className="text-xs font-mono font-bold text-gray-500 uppercase">Done</div>
                        </div>
                        <div className="text-center border-2 border-black p-4 bg-yellow-100">
                            <div className="text-3xl font-black">{routeData.stats.pending}</div>
                            <div className="text-xs font-mono font-bold text-gray-500 uppercase">Left</div>
                        </div>
                    </div>

                    <Link href="/partner/route">
                        <BrutalButton className="w-full text-xl h-20 border-4 shadow-[4px_4px_0px_#000] flex justify-between px-8">
                            <span>{routeData.stats.pending > 0 ? "HIT THE ROAD" : "VIEW ROUTE"}</span>
                            <ArrowRight className="w-8 h-8" strokeWidth={3} />
                        </BrutalButton>
                    </Link>

                    {routeData.stats.missed > 0 && (
                        <div className="mt-8 p-4 border-4 border-black bg-red-100 flex gap-4 items-start">
                            <AlertTriangle className="w-8 h-8 text-error shrink-0" strokeWidth={2.5} />
                            <div>
                                <h4 className="font-bold font-mono uppercase text-error">Attention Needed</h4>
                                <p className="text-sm font-mono font-bold">
                                    {routeData.stats.missed} deliveries marked as missed today.
                                </p>
                            </div>
                        </div>
                    )}
                </BrutalCard>
            )}
        </div>
    );
}
