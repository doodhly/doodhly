
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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

export default function AdminDashboardPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [s, p] = await Promise.all([
                api.get<Summary>("/admin/summary"),
                api.get<Product[]>("/admin/products")
            ]);
            setSummary(s);
            setProducts(p);
        } catch (err) {
            console.error("Admin Fetch Error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Live refresh every 60s
        return () => clearInterval(interval);
    }, []);

    const toggleProduct = async (id: number, current: boolean) => {
        try {
            await api.patch(`/admin/products/${id}/toggle`, { is_active: !current });
            setProducts(products.map(p => p.id === id ? { ...p, is_active: !current } : p));
        } catch (err) {
            alert("Failed to update product");
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Loading Admin Hub...</div>;

    const totalDeliveries = summary?.deliveries.reduce((acc, curr) => acc + Number(curr.count), 0) || 0;
    const completed = summary?.deliveries.find(d => d.status === 'DELIVERED')?.count || 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Operations Hub</h1>
                    <p className="text-slate-500 font-medium">Real-time business monitoring</p>
                </div>
                <div className="bg-white border rounded-lg px-4 py-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live System</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-brand-blue text-white p-6 rounded-3xl shadow-xl shadow-brand-blue/20">
                    <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-2">Today's Fulfillment</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black">{completed}</span>
                        <span className="text-xl opacity-60">/ {totalDeliveries}</span>
                    </div>
                    <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-1000"
                            style={{ width: `${totalDeliveries > 0 ? (Number(completed) / totalDeliveries) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Active Customers</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-black text-slate-900">{summary?.metrics?.activeUsers || 0}</span>
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase">Growth</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Activity this month: <span className="font-bold text-slate-700">{summary?.metrics?.monthlyVisitors || 0}</span></p>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <div className="h-20 w-20 bg-brand-blue rounded-full blur-3xl" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                            Online Now
                        </h3>
                        <span className="text-4xl font-black text-brand-blue">{summary?.metrics?.onlineUsers || 0}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Active in last 5 minutes</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alerts & Issues</h3>
                    <div className="flex items-baseline gap-4">
                        <div>
                            <span className="text-3xl font-black text-red-500">{summary?.deliveries.find(d => d.status === 'MISSED')?.count || 0}</span>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Missed</span>
                        </div>
                        <div className="h-8 border-l border-slate-100" />
                        <div>
                            <span className="text-3xl font-black text-amber-500">{summary?.lowBalanceUsers.length || 0}</span>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Low Bal</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inventory Management */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 px-1">Inventory Control</h2>
                    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                        {products.map((product) => (
                            <div key={product.id} className="flex justify-between items-center p-5 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-900">{product.name}</h4>
                                    <p className="text-xs text-slate-500">Rs. {product.price_paisa / 100} / Unit</p>
                                </div>
                                <button
                                    onClick={() => toggleProduct(product.id, product.is_active)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        product.is_active
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                    )}
                                >
                                    {product.is_active ? "Active" : "Inactive"}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Operations Feed */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 px-1">Recent Issues</h2>
                    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden min-h-[300px]">
                        {summary?.recentIssues.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">No issues reported today.</div>
                        ) : (
                            summary?.recentIssues.map((issue, i) => (
                                <div key={i} className="p-4 border-b last:border-0 flex gap-4">
                                    <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 font-bold text-xs shrink-0">!</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{issue.name || "Customer"}</p>
                                        <p className="text-xs text-slate-600 bg-red-50 inline-block px-2 py-0.5 rounded mt-1 font-medium">Issue: {issue.status}</p>
                                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">
                                            {new Date(issue.updated_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
