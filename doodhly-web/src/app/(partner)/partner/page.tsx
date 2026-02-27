"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { syncRunSheet, RunSheetItem } from "@/lib/deliveries";
import { Container } from "@/components/ui/Container";
import {
    MapPin,
    Navigation,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ChevronRight,
    Wifi,
    WifiOff,
    Loader2
} from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { cn } from "@/lib/utils";

export default function PartnerDashboard() {
    const { user, logout } = useAuth();
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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <LazyMotion features={domAnimation}>
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-900/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-full h-64 bg-indigo-900/10 blur-[80px]" />
            </div>

            <Container className="p-4 pt-8 relative z-10 space-y-8">
                <m.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-start"
                >
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                            <MapPin className="w-3 h-3" />
                            {user?.default_city_id || "Sakti, CG"}
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter">
                            Hello, {user?.name?.split(' ')[0] || "Partner"}
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Ready for today's run?</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-lg",
                            isOnline
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
                        )}>
                            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {isOnline ? "Online" : "Offline"}
                        </div>
                        {pendingCount > 0 && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-1 rounded text-[9px] font-bold">
                                {pendingCount} Pending Syncs
                            </div>
                        )}
                    </div>
                </m.header>

                <m.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                >
                    <m.div variants={item} className="p-1 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-2xl">
                        <div className="bg-slate-900/80 backdrop-blur-xl rounded-[1.4rem] p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white text-lg">Today's Progress</h3>
                                <span className="text-3xl font-black text-blue-400">{routeData.stats.progress}%</span>
                            </div>

                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mb-8">
                                <m.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${routeData.stats.progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-black text-white">{routeData.stats.total}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-emerald-400">{routeData.stats.completed}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Done</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-amber-400">{routeData.stats.pending}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Left</div>
                                </div>
                            </div>
                        </div>
                    </m.div>

                    <m.div variants={item}>
                        <Link href="/partner/route">
                            <button className="w-full h-16 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all rounded-2xl flex items-center justify-between px-6 shadow-xl shadow-blue-900/20 group border-t border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Navigation className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-lg leading-tight">
                                            {routeData.stats.pending > 0 ? "Continue Route" : "View Route"}
                                        </div>
                                        <div className="text-blue-200 text-xs font-medium">
                                            {routeData.stats.pending > 0 ? `${routeData.stats.pending} stops remaining` : "All stops completed"}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </div>
                            </button>
                        </Link>
                    </m.div>

                    {routeData.stats.missed > 0 && (
                        <m.div variants={item} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-red-400">Attention Needed</h4>
                                <p className="text-sm text-red-300/80 mt-1 leading-relaxed">
                                    You have marked <span className="font-bold text-red-300">{routeData.stats.missed} deliveries</span> as missed/failed today. Please report these to the hub if not done already.
                                </p>
                            </div>
                        </m.div>
                    )}

                    {routeData.stats.total === 0 && !routeData.loading && (
                        <m.div variants={item} className="text-center p-8 border border-dashed border-slate-800 rounded-3xl">
                            <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                                <Clock className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="font-bold text-slate-400 text-lg">No Route Assigned</h3>
                            <p className="text-slate-600 text-sm mt-2">
                                Check back later or contact your supervisor if you believe this is an error.
                            </p>
                        </m.div>
                    )}

                    {routeData.loading && (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    )}
                </m.div>
            </Container>
        </div>
        </LazyMotion>
    );
}
