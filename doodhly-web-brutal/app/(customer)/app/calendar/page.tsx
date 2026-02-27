"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { Calendar as CalendarIcon, Truck, CheckCircle2, XCircle } from "lucide-react";

export default function CalendarPage() {
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeliveries = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await api.get<any[]>(`/delivery?date=${today}`);
                setDeliveries(res || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDeliveries();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-4xl bg-brutal-bg uppercase">LOADING...</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
            <div className="border-b-4 border-black pb-8">
                <h1 className="font-sans font-black text-6xl md:text-8xl mb-2 uppercase flex items-center gap-4">
                    <CalendarIcon className="w-16 h-16 hidden md:block" strokeWidth={3} /> CALENDAR.
                </h1>
                <p className="font-mono font-bold text-xl uppercase tracking-widest text-gray-600">
                    Your Upcoming Milk Drops
                </p>
            </div>

            {deliveries.length === 0 ? (
                <BrutalCard className="p-12 text-center border-4 border-dashed border-gray-400 bg-gray-100 shadow-none">
                    <Truck className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                    <h2 className="font-black text-4xl mb-4 text-gray-400 uppercase">NO DELIVERIES FOUND</h2>
                    <p className="font-mono font-bold text-gray-500 uppercase">Check back later or start a new subscription.</p>
                </BrutalCard>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {deliveries.map((delivery, i) => (
                        <BrutalCard key={i} className="border-4 shadow-[6px_6px_0px_#000] flex flex-col justify-between">
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-mono font-bold text-sm bg-black text-white px-2 py-1 uppercase">{delivery.date || 'TODAY'}</span>
                                    {delivery.status === 'DELIVERED' ? (
                                        <CheckCircle2 className="text-success w-8 h-8" strokeWidth={3} />
                                    ) : delivery.status === 'SKIPPED' ? (
                                        <XCircle className="text-error w-8 h-8" strokeWidth={3} />
                                    ) : (
                                        <Truck className="text-brutal-primary w-8 h-8" strokeWidth={3} />
                                    )}
                                </div>
                                <h3 className="font-black text-2xl uppercase mb-2">Cow Milk (1L)</h3>
                                <p className="font-mono font-bold flex justify-between border-b-2 border-black pb-2">
                                    <span>STATUS</span>
                                    <span className={`uppercase ${delivery.status === 'DELIVERED' ? 'text-success' : delivery.status === 'SKIPPED' ? 'text-error' : 'text-brutal-primary'}`}>
                                        {delivery.status || 'PENDING'}
                                    </span>
                                </p>
                            </div>
                            <BrutalButton variant="outline" className="w-full text-xs hover:bg-black hover:text-white transition-colors" disabled={delivery.status === 'DELIVERED' || delivery.status === 'SKIPPED'}>
                                MODIFY DELIVERY
                            </BrutalButton>
                        </BrutalCard>
                    ))}
                </div>
            )}
        </div>
    );
}
