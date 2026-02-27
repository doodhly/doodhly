"use client";

import { useAuth } from "@/context/AuthContext";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { BrutalStat } from "@/components/brutal/BrutalStat";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Plus, Calendar, Truck, AlertTriangle, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        api.get<{ balance: number }>('/customer/wallet')
            .then(res => setBalance(res.balance))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center font-black text-4xl bg-brutal-bg uppercase">LOADING...</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 pb-20">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black pb-8">
                <div>
                    <h1 className="font-sans font-black text-6xl md:text-8xl mb-2 leading-[0.8]">
                        SUP, <br />
                        <span className="text-brutal-primary">{user?.name?.split(' ')[0].toUpperCase()}.</span>
                    </h1>
                </div>
                <div className="bg-black text-white px-6 py-4 border-4 border-white shadow-[4px_4px_0px_#000] transform rotate-1">
                    <p className="font-mono font-bold text-sm uppercase tracking-widest mb-1 opacity-70">CURRENT STREAK</p>
                    <div className="font-sans font-black text-4xl leading-none">{user?.streak_count || 0} DAYS 🔥</div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Wallet Widget */}
                <BrutalCard color="bg-brutal-yellow" className="flex flex-col justify-between min-h-[300px] border-4 shadow-[8px_8px_0px_#000]">
                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <h2 className="font-mono font-bold uppercase tracking-widest text-sm border-b-2 border-black pb-1">Wallet</h2>
                            <Wallet className="w-8 h-8" strokeWidth={2.5} />
                        </div>
                        <div className="font-sans font-black text-7xl tracking-tighter">₹{balance || 0}</div>
                    </div>

                    <Link href="/app/wallet" className="mt-8">
                        <BrutalButton className="w-full bg-white text-json border-4 shadow-[4px_4px_0px_#000]" size="lg">
                            ADD CASH <ArrowRight className="ml-2 w-5 h-5" />
                        </BrutalButton>
                    </Link>
                </BrutalCard>

                {/* Subscription Widget - Spans 2 cols */}
                <BrutalCard color="bg-white" className="md:col-span-2 border-4 shadow-[8px_8px_0px_#000] flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <h2 className="font-mono font-bold uppercase tracking-widest text-sm border-b-2 border-black pb-1">Next Delivery</h2>
                        <div className="bg-success text-black border-2 border-black px-3 py-1 font-bold text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                            <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
                            Active
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row items-center gap-8 mb-8">
                        <div className="bg-brutal-blue border-4 border-black p-6 rounded-none shadow-[4px_4px_0px_#000]">
                            <Truck className="h-16 w-16 text-black" strokeWidth={2} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-sans font-black text-4xl mb-2">DAILY COW MILK (1L)</h3>
                            <p className="font-mono font-bold text-gray-500 uppercase">Arriving Tomorrow by 7:00 AM</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        <BrutalButton variant="outline" className="w-full justify-center border-4 h-16 text-lg hover:bg-brutal-pink hover:text-white">
                            <Calendar className="mr-2 h-6 w-6" /> MODIFY
                        </BrutalButton>
                        <BrutalButton variant="outline" className="w-full justify-center border-4 h-16 text-lg hover:bg-brutal-yellow">
                            <AlertTriangle className="mr-2 h-6 w-6" /> REPORT
                        </BrutalButton>
                    </div>
                </BrutalCard>
            </div>

            {/* Quick Actions Grid */}
            <div className="border-t-4 border-black pt-12">
                <h2 className="font-sans font-black text-5xl mb-8 uppercase">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Link href="/products" className="group">
                        <BrutalCard className="h-40 flex flex-col items-center justify-center gap-4 hover:bg-brutal-primary hover:text-white transition-colors cursor-pointer border-4 group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:shadow-none">
                            <Plus className="h-10 w-10" />
                            <span className="font-mono font-bold uppercase text-lg">New Order</span>
                        </BrutalCard>
                    </Link>
                    <BrutalCard className="h-40 flex flex-col items-center justify-center gap-4 opacity-50 cursor-not-allowed border-4 border-gray-400 bg-gray-100 text-gray-400 shadow-none">
                        <span className="font-mono font-bold uppercase text-lg">Pause All</span>
                    </BrutalCard>
                </div>
            </div>
        </div>
    );
}
