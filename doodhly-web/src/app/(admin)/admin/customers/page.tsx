"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Search, Wallet, History, Phone, Calendar, ArrowUpRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Customer {
    id: number;
    name: string;
    phone: string;
    whatsapp_number?: string;
    household_size?: number;
    daily_milk_liters?: number;
    address?: string;
    lat?: number;
    lng?: number;
    role: string;
    balance: number;
    is_active: boolean;
    last_seen_at?: string;
    created_at: string;
}

export default function AdminCustomersPage() {
    const [fetchState, setFetchState] = useState<{ customers: Customer[]; loading: boolean }>({
        customers: [],
        loading: true,
    });
    const [search, setSearch] = useState("");
    const [rechargeModal, setRechargeModal] = useState<{ user: Customer | null; amount: string; note: string; processing: boolean }>({
        user: null,
        amount: "",
        note: "",
        processing: false,
    });

    const fetchCustomers = async (term = "") => {
        try {
            const data = await api.get<Customer[]>(`/admin/customers${term ? `?search=${term}` : ""}`);
            setFetchState(prev => ({ ...prev, customers: data, loading: false }));
        } catch (err) {
            console.error("Failed to fetch customers", err);
            setFetchState(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchCustomers(search);
        }, 30000);
        return () => clearInterval(interval);
    }, [search]);

    const handleImpersonate = async (userId: number) => {
        if (!confirm("Are you sure you want to impersonate this customer? You will be redirected to their dashboard.")) return;

        try {
            const res = await api.post<{ data: { token: string; user: Customer } }>(`/admin/impersonate`, { targetUserId: userId });
            const { token, user } = res.data;

            // The AuthContext normally handles saving the token.
            // But since we are crossing app domains (admin -> customer app), a full page reload helps reset all state cleanly.
            // We set it in localStorage exactly how the AuthContext expects it.
            localStorage.setItem("auth_token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // Hard navigate to the customer dashboard so that React trees unmount and remount fresh securely
            window.location.href = "/app/dashboard";

        } catch (err: any) {
            alert(err.message || "Failed to impersonate customer");
        }
    };

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rechargeModal.user) return;

        setRechargeModal(prev => ({ ...prev, processing: true }));
        try {
            await api.post(`/admin/customers/${rechargeModal.user!.id}/wallet-adjust`, {
                amount_paisa: Number(rechargeModal.amount) * 100,
                note: rechargeModal.note || "Manual admin recharge"
            });
            await fetchCustomers(search);
            setRechargeModal({ user: null, amount: "", note: "", processing: false });
        } catch (err) {
            alert("Recharge failed");
            setRechargeModal(prev => ({ ...prev, processing: false }));
        }
    };

    const toggleStatus = async (id: number, current: boolean) => {
        try {
            await api.patch(`/admin/customers/${id}/toggle-status`, { is_active: !current });
            setFetchState(prev => ({ ...prev, customers: prev.customers.map(c => c.id === id ? { ...c, is_active: !current } : c) }));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const formatLastSeen = (dateStr?: string) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    if (fetchState.loading) return <div className="p-8 text-slate-500">Loading Customer Registry...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Management</h1>
                    <p className="text-sm text-slate-500">Monitor users, portfolios and wallets</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="w-full bg-white border rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white rounded-[2rem] border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Household / Reqs</th>
                            <th className="px-6 py-4">Wallet Balance</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {fetchState.customers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center font-bold relative">
                                            {user.name ? user.name[0] : "#"}
                                            {user.last_seen_at && (Date.now() - new Date(user.last_seen_at).getTime() < 300000) && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">{user.name || "New Customer"}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Joined {new Date(user.created_at).toLocaleDateString()} • Seen {formatLastSeen(user.last_seen_at)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(user.id, user.is_active)}
                                        className={cn(
                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                            user.is_active
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                        )}
                                    >
                                        {user.is_active ? "Active" : "Inactive"}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><Phone size={10} /> {user.phone}</p>
                                        {user.whatsapp_number && (
                                            <a
                                                href={`https://wa.me/${user.whatsapp_number.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-green-600 font-bold hover:underline flex items-center gap-1"
                                            >
                                                <History size={10} /> WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2">
                                            {user.household_size && (
                                                <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">
                                                    {user.household_size} Adults
                                                </div>
                                            )}
                                            {user.daily_milk_liters && (
                                                <div className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold">
                                                    {user.daily_milk_liters}L/D
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.address || "No address set"}</p>
                                            {user.lat && user.lng && (
                                                <a
                                                    href={`https://www.google.com/maps?q=${user.lat},${user.lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-brand-blue font-black flex items-center gap-1 hover:underline shrink-0"
                                                >
                                                    <MapPin size={10} className="text-red-500" /> Map
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                                        (user.balance || 0) < 5000 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                    )}>
                                        <Wallet size={12} />
                                        ₹{(user.balance || 0) / 100}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleImpersonate(user.id)}
                                        className="rounded-xl border-brand-blue/20 text-brand-blue hover:bg-brand-blue/10 font-bold"
                                        title="Log in as this customer"
                                    >
                                        Impersonate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRechargeModal(prev => ({ ...prev, user }))}
                                        className="rounded-xl bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                                    >
                                        Recharge
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {
                    fetchState.customers.length === 0 && (
                        <div className="p-20 text-center text-slate-400">No customers found matching your criteria.</div>
                    )
                }
            </div >

            {
                rechargeModal.user && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manual Recharge</h2>
                                <button onClick={() => setRechargeModal(prev => ({ ...prev, user: null }))} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 flex gap-4 items-center">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-brand-blue">
                                    {rechargeModal.user.name ? rechargeModal.user.name[0] : "#"}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{rechargeModal.user.name || "New Customer"}</p>
                                    <p className="text-xs text-slate-400">Current Balance: ₹{(rechargeModal.user.balance || 0) / 100}</p>
                                </div>
                            </div>

                            <form onSubmit={handleRecharge} className="space-y-4">
                                <div>
                                    <label htmlFor="recharge-amount" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                        <input
                                            id="recharge-amount"
                                            type="number"
                                            required
                                            className="w-full bg-slate-50 border-transparent rounded-2xl pl-8 pr-4 py-4 text-lg font-bold focus:ring-2 focus:ring-brand-blue"
                                            placeholder="500"
                                            value={rechargeModal.amount}
                                            onChange={e => setRechargeModal(prev => ({ ...prev, amount: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="recharge-note" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Internal Note</label>
                                    <input
                                        id="recharge-note"
                                        className="w-full bg-slate-50 border-transparent rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-blue"
                                        placeholder="Cash collected / Promotional credit"
                                        value={rechargeModal.note}
                                        onChange={e => setRechargeModal(prev => ({ ...prev, note: e.target.value }))}
                                    />
                                </div>
                                <Button type="submit" disabled={rechargeModal.processing} className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
                                    <ArrowUpRight size={20} />
                                    {rechargeModal.processing ? "Processing..." : "Confirm Credit"}
                                </Button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
