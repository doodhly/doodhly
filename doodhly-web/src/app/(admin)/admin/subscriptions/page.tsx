"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Calendar, Package, RefreshCw, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subscription {
    id: number;
    customer_name: string;
    product_name: string;
    status: string;
    quantity: number;
    frequency: string;
    start_date: string;
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = async () => {
        try {
            const data = await api.get<Subscription[]>("/admin/subscriptions");
            setSubscriptions(data);
        } catch (err) {
            console.error("Failed to fetch subscriptions", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    if (loading) return <div className="p-8 text-slate-500">Loading Subscriptions...</div>;

    const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Oversight</h1>
                    <p className="text-sm text-slate-500">Managing {activeCount} active recurring orders</p>
                </div>
                <button onClick={fetchSubscriptions} className="p-3 bg-white border rounded-2xl hover:bg-slate-50 transition-colors">
                    <RefreshCw size={20} className="text-slate-400" />
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-brand-blue p-6 rounded-[2rem] text-white">
                    <Layers size={24} className="opacity-60 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Slots</p>
                    <p className="text-3xl font-black">{subscriptions.length}</p>
                </div>
                <div className="bg-white border p-6 rounded-[2rem]">
                    <Package size={24} className="text-slate-400 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Orders</p>
                    <p className="text-3xl font-black text-slate-900">{activeCount}</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Product / Quantity</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Frequency</th>
                            <th className="px-6 py-4">Starts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {subscriptions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-900">{sub.customer_name || "New Customer"}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">ID: #{sub.id}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-brand-blue">{sub.product_name}</p>
                                    <p className="text-xs text-slate-500">Qty: {sub.quantity}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        sub.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                        <Calendar size={14} className="text-slate-400" />
                                        {sub.frequency.replace('_', ' ')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500">
                                    {new Date(sub.start_date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subscriptions.length === 0 && (
                    <div className="p-20 text-center text-slate-400">No subscriptions found.</div>
                )}
            </div>
        </div>
    );
}
