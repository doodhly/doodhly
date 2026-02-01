"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Sun, Calendar, Plus, PauseCircle, ChevronRight, Truck, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface WalletData {
    balance: number;
    currency: string;
}

interface Subscription {
    id: string;
    productName: string;
    quantity: number;
    frequency: string;
    status: string;
    nextDeliveryDate: string;
}

export default function Dashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // Real data states
    const [balance, setBalance] = useState<number | null>(null);
    const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) return; // Will redirect via AuthContext

        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch wallet balance
                const walletRes = await api.get<WalletData>('/customer/wallet');
                setBalance(walletRes.balance);

                // Fetch subscriptions and get the first active one
                const subsRes = await api.get<Subscription[]>('/customer/subscriptions');
                const activeSub = subsRes?.find((s: Subscription) => s.status === 'ACTIVE');
                setActiveSubscription(activeSub || null);
            } catch (err: any) {
                console.error('Dashboard fetch error:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, authLoading]);

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center text-brand-blue/80 mb-1 font-medium gap-2"
                    >
                        <Sun className="h-5 w-5" /> Good Morning
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-serif font-bold text-brand-blue mt-1"
                    >
                        {user?.name || "Customer"}
                    </motion.h1>
                </div>

                {/* Wallet Widget */}
                <div onClick={() => router.push('/app/wallet')} className="cursor-pointer group">
                    <GlassCard className="px-5 py-3 flex items-center gap-4 bg-white/80 border-brand-blue/10 hover:border-brand-blue/30 transition-all hover:-translate-y-1 shadow-sm">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Wallet Balance</p>
                            <p className="text-2xl font-bold text-brand-blue">
                                ₹{balance !== null ? balance : '--'}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center shadow-lg shadow-brand-blue/20 group-hover:scale-105 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                    </GlassCard>
                </div>
            </header>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Next Delivery Card */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xl font-bold text-gray-800">Next Delivery</h2>
                    <Button variant="ghost" className="text-brand-blue hover:bg-brand-blue/5 h-auto p-2" onClick={() => router.push('/app/calendar')}>
                        View Schedule <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                {activeSubscription ? (
                    <GlassCard className="p-0 overflow-hidden border-brand-blue/10 group">
                        <div className="bg-brand-cream/50 p-6 md:p-8 flex items-start justify-between relative">
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                            <div className="flex gap-6 relative z-10">
                                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-brand-blue shadow-sm border border-brand-blue/5">
                                    <Truck className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border border-green-200">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                                            </span>
                                            Active
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-brand-blue">
                                        {activeSubscription.quantity}L {activeSubscription.productName}
                                    </h3>
                                    <p className="text-gray-500 mt-1 font-medium ml-0.5">
                                        {activeSubscription.frequency === 'DAILY' ? 'Daily' : 'Alternate Days'} • Morning Slot
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/60 backdrop-blur border-t border-brand-blue/5 flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 border border-gray-200 hover:border-brand-blue/30 text-gray-700 font-semibold shadow-sm bg-white"
                                onClick={() => router.push('/app/subscriptions')}
                            >
                                <PauseCircle className="w-4 h-4 mr-2 text-gray-500" />
                                Pause / Edit
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border border-gray-200 hover:border-brand-blue/30 text-gray-700 font-semibold shadow-sm bg-white"
                                onClick={() => router.push('/app/calendar')}
                            >
                                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                View Calendar
                            </Button>
                        </div>
                    </GlassCard>
                ) : (
                    <GlassCard className="p-8 text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Truck className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">No Active Subscription</h3>
                        <p className="text-gray-500 mb-4">Start your fresh milk journey today!</p>
                        <Button onClick={() => router.push('/products')} className="bg-brand-blue text-white">
                            Browse Products
                        </Button>
                    </GlassCard>
                )}
            </section>

            {/* Quick Actions / Banners */}
            <section className="grid md:grid-cols-2 gap-6">
                {/* Calendar Shortcut */}
                <Link href="/app/calendar">
                    <GlassCard hoverEffect className="cursor-pointer h-full flex items-center justify-between p-6 border-white/60 bg-white/40">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Delivery Calendar</h3>
                                <p className="text-sm text-gray-500">Check upcoming deliveries</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </GlassCard>
                </Link>

                {/* Products Shortcut */}
                <Link href="/products">
                    <GlassCard hoverEffect className="cursor-pointer h-full flex items-center justify-between p-6 border-white/60 bg-white/40">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Browse Products</h3>
                                <p className="text-sm text-gray-500">Add more items to your plan</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </GlassCard>
                </Link>
            </section>
        </div>
    );
}
