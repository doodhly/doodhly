"use client";

import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { User, Search, Plus, Wallet, ArrowUpRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminCustomers() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rechargeModal, setRechargeModal] = useState<{ user: any; amount: string; note: string; processing: boolean }>({
        user: null,
        amount: "",
        note: "",
        processing: false,
    });

    const fetchCustomers = () => {
        setLoading(true);
        api.get<any>('/admin/users')
            .then(res => setCustomers(res.users || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rechargeModal.user) return;

        setRechargeModal(prev => ({ ...prev, processing: true }));
        try {
            await api.post(`/admin/customers/${rechargeModal.user!.id}/wallet-adjust`, {
                amount_paisa: Number(rechargeModal.amount) * 100,
                note: rechargeModal.note || "Manual admin recharge"
            });
            fetchCustomers();
            setRechargeModal({ user: null, amount: "", note: "", processing: false });
        } catch (err) {
            alert("Recharge failed");
            setRechargeModal(prev => ({ ...prev, processing: false }));
        }
    };

    return (
        <div className="space-y-8 pb-20 relative">
            <div className="border-b-4 border-black pb-6 flex justify-between items-end">
                <div>
                    <h1 className="font-sans font-black text-5xl md:text-7xl uppercase mb-2 flex items-center gap-4">
                        <User className="w-12 h-12 hidden md:block" strokeWidth={3} /> CUSTOMERS.
                    </h1>
                    <p className="font-mono font-bold text-gray-500 uppercase">Manage User Accounts</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <BrutalButton><Plus className="w-5 h-5 mr-2" /> ADD CUSTOMER</BrutalButton>
                </div>
            </div>

            <BrutalCard className="border-4 bg-white p-4 shadow-[8px_8px_0px_#000] flex gap-4 items-center">
                <Search className="w-6 h-6 shrink-0" />
                <input
                    type="text"
                    placeholder="SEARCH BY PHONE OR NAME..."
                    className="w-full font-mono font-bold uppercase text-lg outline-none bg-transparent placeholder-gray-400"
                />
            </BrutalCard>

            <BrutalCard className="border-4 bg-white p-0 overflow-hidden shadow-[8px_8px_0px_#000]">
                {loading ? (
                    <div className="p-8 text-center font-black text-2xl uppercase">LOADING DATA...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono font-bold uppercase whitespace-nowrap">
                            <thead className="bg-brutal-pink border-b-4 border-black">
                                <tr>
                                    <th className="p-4 border-r-2 border-black">Name</th>
                                    <th className="p-4 border-r-2 border-black">Phone</th>
                                    <th className="p-4 border-r-2 border-black">Role</th>
                                    <th className="p-4 border-r-2 border-black text-center">Wallet</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center uppercase text-gray-400">NO CUSTOMERS FOUND</td></tr>
                                ) : customers.map((c, i) => (
                                    <tr key={c.id || i} className="border-b-2 border-black hover:bg-brutal-bg transition-colors">
                                        <td className="p-4 border-r-2 border-dashed border-black">{c.name || "UNNAMED"}</td>
                                        <td className="p-4 border-r-2 border-dashed border-black">{c.phone || c.phone_hash}</td>
                                        <td className="p-4 border-r-2 border-dashed border-black">
                                            <span className={`px-2 py-1 text-xs border-2 border-black ${c.role === 'ADMIN' ? 'bg-black text-white' : 'bg-brutal-yellow'}`}>
                                                {c.role || "CUSTOMER"}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r-2 border-dashed border-black text-center font-black flex justify-center items-center gap-2">
                                            <Wallet className="w-4 h-4" /> ₹{((c.balance || c.wallet_balance || 0) / 100).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center space-x-2 flex justify-center">
                                            <BrutalButton variant="outline" className="text-xs px-2 py-1 h-8" onClick={() => setRechargeModal(prev => ({ ...prev, user: c }))}>RECHARGE</BrutalButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </BrutalCard>

            {rechargeModal.user && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <BrutalCard className="bg-white border-8 border-black w-full max-w-md p-8 shadow-[16px_16px_0px_#000]">
                        <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4">
                            <h2 className="text-3xl font-black uppercase">Manual Recharge</h2>
                            <button onClick={() => setRechargeModal(prev => ({ ...prev, user: null }))} className="hover:bg-black hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors">
                                <X size={28} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="bg-brutal-blue border-4 border-black p-4 flex flex-col gap-2 mb-6 shadow-[4px_4px_0px_#000]">
                            <p className="font-black text-xl uppercase">{rechargeModal.user.name || "Customer"}</p>
                            <p className="font-mono font-bold text-sm bg-white border-2 border-black self-start px-2 py-1">
                                BALANCE: ₹{((rechargeModal.user.balance || rechargeModal.user.wallet_balance || 0) / 100).toFixed(2)}
                            </p>
                        </div>

                        <form onSubmit={handleRecharge} className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-mono font-black text-sm uppercase">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl">₹</span>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-brutal-bg border-4 border-black pl-10 pr-4 py-3 text-xl font-black outline-none focus:bg-brutal-yellow transition-colors shadow-[4px_4px_0px_#000]"
                                        placeholder="500"
                                        value={rechargeModal.amount}
                                        onChange={e => setRechargeModal(prev => ({ ...prev, amount: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-mono font-black text-sm uppercase">Internal Note</label>
                                <input
                                    type="text"
                                    className="w-full bg-brutal-bg border-4 border-black p-3 text-lg font-bold outline-none focus:bg-brutal-yellow transition-colors shadow-[4px_4px_0px_#000]"
                                    placeholder="Cash collected..."
                                    value={rechargeModal.note}
                                    onChange={e => setRechargeModal(prev => ({ ...prev, note: e.target.value }))}
                                />
                            </div>

                            <BrutalButton type="submit" disabled={rechargeModal.processing} className="w-full justify-center h-16 text-xl bg-brutal-green">
                                {rechargeModal.processing ? "PROCESSING..." : (
                                    <><ArrowUpRight className="w-6 h-6 mr-2" strokeWidth={3} /> CONFIRM CREDIT</>
                                )}
                            </BrutalButton>
                        </form>
                    </BrutalCard>
                </div>
            )}
        </div>
    );
}
