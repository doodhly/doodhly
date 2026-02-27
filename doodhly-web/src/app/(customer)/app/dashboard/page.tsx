"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import SmartSavingsWidget from "@/components/dashboard/SmartSavingsWidget";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Sun, Calendar, Plus, PauseCircle, ChevronRight, Truck, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m } from "framer-motion";
import dynamic from "next/dynamic";
import { Container } from "@/components/ui/Container";
import { fadeUp, staggerContainer } from "@/lib/motion";

const LiveTrackingMap = dynamic(() => import("@/components/customer/LiveTrackingMap"), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
});

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

    // Queries
    const { data: wallet, isLoading: walletLoading, error: walletError } = useQuery({
        queryKey: ['wallet'],
        queryFn: () => api.get<WalletData>('/customer/wallet'),
        enabled: !!user,
    });

    const { data: subscriptions, isLoading: subsLoading, error: subsError } = useQuery({
        queryKey: ['subscriptions'],
        queryFn: () => api.get<Subscription[]>('/customer/subscriptions'),
        enabled: !!user,
    });

    const { data: deliveries, isLoading: deliveriesLoading, error: deliveriesError } = useQuery({
        queryKey: ['deliveries', new Date().toISOString().split('T')[0]],
        queryFn: () => {
            const today = new Date().toISOString().split('T')[0];
            return api.get<any[]>(`/delivery?date=${today}`);
        },
        enabled: !!user,
    });

    // Derived State
    const activeSubscription = subscriptions?.find((s: Subscription) => s.status === 'ACTIVE') || null;
    const todayDelivery = deliveries?.find((d: any) => d.status !== 'DELIVERED' && d.status !== 'SKIPPED') || null;
    const loading = authLoading || walletLoading || subsLoading || deliveriesLoading;
    const error = walletError || subsError || deliveriesError ? 'Failed to load dashboard data' : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    return (
        <LazyMotion features={domAnimation}>
            <Container className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
                <m.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    <m.div variants={fadeUp} className="lg:col-span-2 space-y-8">
                        <m.header variants={fadeUp} className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center text-brand-blue/80 mb-1 font-medium gap-2">
                                    <Sun className="h-5 w-5" /> Good Morning
                                </div>
                                <h1 className="text-3xl font-serif font-bold text-brand-blue mt-1">
                                    {user?.name || "Customer"}
                                </h1>
                            </div>
                        </m.header>

                        {error && (
                            <m.div variants={fadeUp} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </m.div>
                        )}

                        <m.section variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GlassCard tilt className="p-6 bg-gradient-to-br from-orange-50/80 to-amber-50/80 border-amber-100 relative overflow-hidden rounded-2xl">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">🔥</span>
                                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Daily Streak</span>
                                    </div>
                                    <div className="flex items-baseline gap-1 my-1">
                                        <span className="text-3xl font-bold text-gray-900">{user?.streak_count || 0}</span>
                                        <span className="text-sm text-gray-500 font-medium">Days</span>
                                    </div>
                                    <p className="text-xs text-amber-600 font-medium mt-1">
                                        Reach 30 days for <span className="font-bold">₹100</span> credit!
                                    </p>
                                </div>
                            </GlassCard>

                            <GlassCard tilt className="p-6 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 border-indigo-100 relative overflow-hidden rounded-2xl">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">👑</span>
                                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                                            {user?.current_tier || 'SILVER'} Member
                                        </span>
                                    </div>
                                    <div className="mt-1">
                                        {user?.current_tier === 'PLATINUM' && <span className="text-xs font-medium text-indigo-600">5% Discount Active</span>}
                                        {user?.current_tier === 'GOLD' && <span className="text-xs font-medium text-indigo-600">Priority Delivery</span>}
                                        {(!user?.current_tier || user?.current_tier === 'SILVER') && <span className="text-xs font-medium text-indigo-600">Upgrade for perks</span>}
                                    </div>
                                </div>
                            </GlassCard>
                        </m.section>

                        {todayDelivery && (
                            <m.section variants={fadeUp} className="mb-8">
                                <LiveTrackingMap deliveryId={todayDelivery.id} />
                            </m.section>
                        )}

                        <m.section variants={fadeUp}>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h2 className="text-xl font-bold text-gray-800">Next Delivery</h2>
                                <Button variant="ghost" className="text-brand-blue hover:bg-brand-blue/5 h-auto p-2" onClick={() => router.push('/app/calendar')}>
                                    View Schedule <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>

                            {activeSubscription ? (
                                <GlassCard tilt className="p-0 overflow-hidden border-brand-blue/10 group">
                                    <div className="bg-brand-cream/50 p-6 md:p-8 flex items-start justify-between relative">
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
                                <GlassCard tilt className="p-8 text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
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
                        </m.section>

                        <m.section variants={fadeUp}>
                            <SmartSavingsWidget />
                        </m.section>

                        <m.section variants={fadeUp} className="grid md:grid-cols-2 gap-6">
                            <Link href="/app/calendar">
                                <GlassCard tilt hoverEffect className="cursor-pointer h-full flex items-center justify-between p-6 border-white/60 bg-white/40">
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

                            <Link href="/products">
                                <GlassCard tilt hoverEffect className="cursor-pointer h-full flex items-center justify-between p-6 border-white/60 bg-white/40">
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
                        </m.section>
                    </m.div>

                    <div className="space-y-8">
                        <GlassCard className="p-8 sticky top-32">
                            <div className="text-center">
                                <h3 className="font-bold text-gray-900 text-lg mb-2">Need Help?</h3>
                                <p className="text-sm text-gray-500 mb-4">Contact our support team for any queries</p>
                                <Button variant="outline" className="w-full">Contact Support</Button>
                            </div>
                        </GlassCard>
                    </div>
                </m.div>
            </Container>
        </LazyMotion>
    );
}
