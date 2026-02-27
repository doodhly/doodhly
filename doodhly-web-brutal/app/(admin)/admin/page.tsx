"use client";

import { useAuth } from "@/context/AuthContext";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { BrutalStat } from "@/components/brutal/BrutalStat";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Users, Package, ShoppingBag, Settings, Plus, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardMetrics {
    subscriptions: { active: number; paused: number; };
    deliveries: { today: string; pending: number; completed: number; };
    growth: { newUsersLast7Days: number; };
    financials: { totalWalletLiabilityPaisa: number; };
}

interface DeliveryStat {
    status: string;
    count: number;
}

interface Summary {
    deliveries: DeliveryStat[];
    lowBalanceUsers: Array<{ name: string; phone: string; balance: number }>;
    recentIssues: Array<{ name: string; status: string; updated_at: string }>;
    metrics: {
        activeUsers: number;
        onlineUsers: number;
        monthlyVisitors: number;
    };
}

interface Product {
    id: number;
    name: string;
    is_active: boolean;
    price_paisa: number;
}

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [s, p, m] = await Promise.all([
                api.get<Summary>("/admin/summary"),
                api.get<Product[]>("/admin/products"),
                api.get<DashboardMetrics>("/admin/metrics/dashboard")
            ]);
            setSummary(s);
            setMetrics(m);
            // Sort products to show active first
            setProducts(p.sort((a, b) => Number(b.is_active) - Number(a.is_active)));
        } catch (err) {
            console.error("Admin Fetch Error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'ADMIN') {
                router.push('/login');
                return;
            }
            fetchData();
            const interval = setInterval(fetchData, 60000); // Live refresh
            return () => clearInterval(interval);
        }
    }, [user, authLoading, router]);

    const toggleProduct = async (id: number, current: boolean) => {
        if (!confirm(`Are you sure you want to ${current ? 'DISABLE' : 'ENABLE'} this product?`)) return;
        try {
            await api.patch(`/admin/products/${id}/toggle`, { is_active: !current });
            setProducts(products.map(p => p.id === id ? { ...p, is_active: !current } : p));
        } catch (err) {
            alert("Failed to update product");
        }
    };

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center font-black text-4xl bg-brutal-bg uppercase">LOADING ADMIN...</div>;

    const activeSubs = summary?.deliveries.reduce((acc, curr) => acc + Number(curr.count), 0) || 0; // Approx mock for subs based on deliveries
    const issuesCount = summary?.recentIssues.length || 0;

    // Revenue mock using active users * avg spend (if real revenue endpoint missing)
    // Or just use online users as a proxy for "Revenue" for visual demo if exact field missing
    const onlineUsers = summary?.metrics?.onlineUsers || 0;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 pb-20">
            {/* Header */}
            <div className="bg-black text-white p-8 md:p-12 border-4 border-black shadow-[12px_12px_0px_#000] relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="font-mono font-bold text-xs bg-brutal-pink text-black px-2 py-1 mb-4 inline-block transform -rotate-2">
                            RESTRICTED AREA
                        </div>
                        <h1 className="font-sans font-black text-6xl md:text-8xl leading-[0.8] uppercase">
                            Command<br />Center.
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-gray-400 uppercase text-sm">System Status</p>
                        <p className="font-sans font-black text-4xl text-success animate-pulse">OPERATIONAL</p>
                    </div>
                </div>
                <Users className="absolute -right-20 -bottom-20 w-96 h-96 text-white opacity-5 rotate-12 pointer-events-none" />
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
                <BrutalStat
                    label="Online"
                    value={onlineUsers.toString()}
                    icon={<Users />}
                    trend={onlineUsers > 0 ? "LIVE" : "OFFLINE"}
                    trendUp={onlineUsers > 0}
                />
                <BrutalStat
                    label="Deliveries"
                    value={activeSubs.toString()}
                    icon={<Package />}
                    color="bg-brutal-yellow"
                />
                <BrutalStat
                    label="Issues"
                    value={issuesCount.toString()}
                    icon={<AlertTriangle />}
                    color={issuesCount > 0 ? "bg-brutal-pink" : "bg-white"}
                />
                <BrutalStat
                    label="Active Users"
                    value={(summary?.metrics?.activeUsers || 0).toString()}
                    icon={<TrendingUp />}
                    trend="+5%"
                    trendUp={true}
                    color="bg-brutal-green"
                />
            </div>

            {/* Analytics Visualization Grid */}
            <BrutalCard className="border-4 shadow-[8px_8px_0px_#000] p-6 lg:p-10 mb-12">
                <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                    <h2 className="font-sans font-black text-3xl md:text-4xl uppercase">Business Intelligence</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        { name: 'Act Subs', value: metrics?.subscriptions.active || 0 },
                                        { name: 'Pau Subs', value: metrics?.subscriptions.paused || 0 },
                                        { name: 'Comp Del', value: metrics?.deliveries.completed || 0 },
                                        { name: 'Pend Del', value: metrics?.deliveries.pending || 0 },
                                    ]}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                                    <XAxis dataKey="name" stroke="#000" tick={{ fontFamily: 'monospace', fontWeight: 'bold' }} />
                                    <YAxis stroke="#000" tick={{ fontFamily: 'monospace' }} />
                                    <Tooltip contentStyle={{ border: '4px solid #000', borderRadius: 0, fontFamily: 'monospace', fontWeight: 'bold' }} />
                                    <Bar dataKey="value" fill="#E2F040" stroke="#000" strokeWidth={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-brutal-blue text-white p-6 border-4 border-black shadow-[4px_4px_0px_#000]">
                            <h3 className="font-sans font-black text-xl uppercase mb-2">Total Liability</h3>
                            <p className="font-mono text-3xl font-bold">₹{((metrics?.financials.totalWalletLiabilityPaisa || 0) / 100).toFixed(2)}</p>
                            <p className="text-sm font-mono mt-2 opacity-80">System-wide unspent wallet balance</p>
                        </div>
                        <div className="bg-brutal-pink text-black p-6 border-4 border-black shadow-[4px_4px_0px_#000]">
                            <h3 className="font-sans font-black text-xl uppercase mb-2">Growth (7D)</h3>
                            <p className="font-mono text-3xl font-bold">+{metrics?.growth.newUsersLast7Days || 0} Users</p>
                        </div>
                    </div>
                </div>
            </BrutalCard>

            {/* Management Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Inventory / Products */}
                <BrutalCard className="border-4 shadow-[8px_8px_0px_#000]">
                    <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                        <h2 className="font-sans font-black text-4xl uppercase">Inventory</h2>
                        <BrutalButton size="sm" className="h-10">
                            <Plus className="mr-2 h-4 w-4" /> ADD ITEM
                        </BrutalButton>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {products.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-4 border-2 border-black hover:bg-brutal-bg transition-colors">
                                <div>
                                    <span className="font-mono font-bold uppercase block">{item.name}</span>
                                    <span className="text-xs font-mono text-gray-500">₹{item.price_paisa / 100}</span>
                                </div>
                                <button
                                    onClick={() => toggleProduct(item.id, item.is_active)}
                                    className={cn(
                                        "font-mono text-xs font-bold px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all",
                                        item.is_active ? "bg-success text-black" : "bg-gray-200 text-gray-500"
                                    )}
                                >
                                    {item.is_active ? "ACTIVE" : "DISABLED"}
                                </button>
                            </div>
                        ))}
                    </div>
                </BrutalCard>

                {/* Audit Log / Recent Issues */}
                <BrutalCard className="border-4 shadow-[8px_8px_0px_#000]">
                    <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                        <h2 className="font-sans font-black text-4xl uppercase">Audit Log</h2>
                        <Settings className="h-6 w-6" />
                    </div>
                    <div className="font-mono text-sm space-y-4 max-h-[400px] overflow-y-auto">
                        {summary?.recentIssues.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 font-bold uppercase">No recent issues. System Clean.</div>
                        ) : (
                            summary?.recentIssues.map((issue, i) => (
                                <div key={`${issue.updated_at}-${i}`} className="flex gap-4 p-4 border-2 border-black bg-red-50">
                                    <div className="text-error font-black">!</div>
                                    <div>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-bold uppercase">{issue.name || "Unknown"}</span>
                                            <span className="text-xs font-bold text-gray-500">{new Date(issue.updated_at).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs">{issue.status}</p>
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="p-4 border-2 border-black bg-gray-100 opacity-50">
                            <span className="font-bold text-gray-500 block mb-1">SYSTEM BOOT</span>
                            <span className="text-xs">Admin dashboard initialized successfully.</span>
                        </div>
                    </div>
                </BrutalCard>
            </div>
        </div>
    );
}
