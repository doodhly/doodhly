"use client";

import { useEffect, useState } from "react";
import { syncRunSheet, RunSheetItem, optimizeRoute } from "@/lib/deliveries";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import Link from "next/link";
import { MapPin, Navigation, RefreshCw, Zap, Check, AlertTriangle, ArrowLeft } from "lucide-react";

export default function PartnerRoutePage() {
    const [deliveries, setDeliveries] = useState<RunSheetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOnline } = useOfflineSync();

    const fetchRoute = async () => {
        setLoading(true);
        try {
            const data = await syncRunSheet();
            const list = Array.isArray(data.deliveries) ? data.deliveries : [];
            setDeliveries(list);
            localStorage.setItem("current_route", JSON.stringify(list));
        } catch (err) {
            console.error("Failed to sync route", err);
            const cached = localStorage.getItem("current_route");
            if (cached) {
                setDeliveries(JSON.parse(cached));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOptimize = async () => {
        setLoading(true);
        try {
            const { optimizedRoute } = await optimizeRoute(deliveries);
            setDeliveries(optimizedRoute);
            alert("Route Optimized!");
        } catch (err) {
            console.error(err);
            alert("Failed to optimize.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoute();
    }, []);

    const handleNavigate = (lat?: number, lng?: number) => {
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
        } else {
            alert("No coordinates for this stop.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
            <header className="mb-8 border-b-4 border-black pb-8 flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <Link href="/partner" className="inline-flex items-center font-mono font-bold uppercase hover:bg-black hover:text-white px-2 mb-4 transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Hub
                    </Link>
                    <h1 className="font-sans font-black text-6xl uppercase leading-none">Daily Run.</h1>
                    <p className="font-mono font-bold mt-2 text-gray-500">{deliveries.length} STOPS TOTAL</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <BrutalButton onClick={fetchRoute} disabled={loading} className="flex-1 md:flex-none">
                        <RefreshCw className={`mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        SYNC
                    </BrutalButton>
                    <BrutalButton onClick={handleOptimize} disabled={loading} variant="outline" className="flex-1 md:flex-none">
                        <Zap className="mr-2 h-5 w-5" />
                        OPTIMIZE
                    </BrutalButton>
                </div>
            </header>

            {!isOnline && (
                <div className="bg-error border-4 border-black p-4 mb-8 font-mono font-bold text-white uppercase text-center shadow-[4px_4px_0px_#000]">
                    ⚠ OFFLINE MODE ACTIVE
                </div>
            )}

            <div className="space-y-6">
                {deliveries.length === 0 && !loading ? (
                    <div className="text-center font-mono font-bold text-gray-400 py-12">NO DELIVERIES FOUND.</div>
                ) : (
                    deliveries.map((item, index) => (
                        <BrutalCard key={item.id} className={`flex flex-col md:flex-row gap-6 p-6 border-4 shadow-[8px_8px_0px_#000] ${item.status === 'DELIVERED' ? 'opacity-60 bg-gray-100' : 'bg-white'}`}>
                            {/* Sequence */}
                            <div className="flex-shrink-0 flex items-center gap-4 border-b-4 md:border-b-0 md:border-r-4 border-black pb-4 md:pb-0 md:pr-6 md:w-24 justify-center">
                                <span className="font-sans font-black text-5xl">#{item.sequence}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-sans font-black text-2xl uppercase">{item.customerName}</h3>
                                    {item.status === 'DELIVERED' && <span className="bg-success border-2 border-black px-2 py-0.5 text-xs font-bold uppercase">DONE</span>}
                                    {item.status === 'MISSED' && <span className="bg-error border-2 border-black px-2 py-0.5 text-xs font-bold uppercase text-white">MISSED</span>}
                                    {item.status === 'PENDING' && <span className="bg-brutal-yellow border-2 border-black px-2 py-0.5 text-xs font-bold uppercase">PENDING</span>}
                                </div>
                                <div className="flex items-start gap-2 text-gray-600 font-mono font-bold text-sm mb-4">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    {item.address}
                                </div>
                                <div className="bg-black text-white p-2 inline-block font-mono text-sm font-bold uppercase">
                                    {item.productName} X {item.quantity} {item.unit}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 justify-center border-t-4 md:border-t-0 md:border-l-4 border-black pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                <BrutalButton
                                    onClick={() => handleNavigate(item.lat, item.lng)}
                                    className="w-full text-sm"
                                    disabled={item.status !== 'PENDING'}
                                >
                                    <Navigation className="mr-2 w-4 h-4" /> NAVIGATE
                                </BrutalButton>
                                {/* Link to details if needed in future */}
                                {/* <Link href={`/partner/delivery/${item.id}`} className="w-full">
                                    <BrutalButton variant="outline" className="w-full text-sm">DETAILS</BrutalButton>
                                </Link> */}
                            </div>
                        </BrutalCard>
                    ))
                )}
            </div>
        </div>
    );
}
