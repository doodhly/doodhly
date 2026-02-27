"use client";

import { useAuth } from "@/context/AuthContext";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";

interface Transaction {
    id: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string;
    created_at: string;
}

export default function WalletPage() {
    const { user } = useAuth();
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (!user) return;
        api.get<{ balance: number }>('/customer/wallet').then(res => setBalance(res.balance));
        api.get<Transaction[]>('/customer/wallet/ledger').then(setTransactions);
    }, [user]);

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-16 pb-20">
            {/* Balance Header */}
            <div className="bg-brutal-green border-4 border-black p-8 md:p-16 text-center shadow-[12px_12px_0px_#000] relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="font-mono font-bold uppercase tracking-widest text-black mb-4 bg-white inline-block px-4 py-1 border-2 border-black rotate-1">Available Funds</h1>
                    <div className="font-sans font-black text-[15vw] md:text-9xl text-black leading-none drop-shadow-hard">
                        ₹{balance}
                    </div>
                </div>
                {/* Decorative BG */}
                <TrendingUp className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] opacity-10 rotate-12" />
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Recharge Section */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-black text-white p-3 border-4 border-black">
                            <ArrowDownLeft className="h-8 w-8" />
                        </div>
                        <h2 className="font-sans font-black text-5xl uppercase">Load Up</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {[500, 1000, 2000, 5000].map(amt => (
                            <BrutalButton key={amt} variant="outline" className="text-2xl font-mono h-24 border-4 shadow-[4px_4px_0px_#000] hover:bg-brutal-yellow">
                                +₹{amt}
                            </BrutalButton>
                        ))}
                    </div>
                </section>

                {/* Ledger Section */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-black text-white p-3 border-4 border-black">
                            <ArrowUpRight className="h-8 w-8" />
                        </div>
                        <h2 className="font-sans font-black text-5xl uppercase">Ledger</h2>
                    </div>

                    <div className="border-4 border-black bg-white shadow-[8px_8px_0px_#000]">
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center font-mono font-bold text-gray-400 text-xl border-b-0">
                                NO MOVES YET.
                            </div>
                        ) : (
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-black text-white font-mono uppercase text-sm sticky top-0">
                                        <tr>
                                            <th className="p-4 border-b-4 border-black">Date</th>
                                            <th className="p-4 border-b-4 border-black">Detail</th>
                                            <th className="p-4 border-b-4 border-black text-right">Amt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-4 divide-black font-mono font-bold">
                                        {transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-brutal-bg">
                                                <td className="p-4 border-r-4 border-black text-xs">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 border-r-4 border-black">
                                                    {tx.description}
                                                </td>
                                                <td className={`p-4 text-right text-lg ${tx.type === 'CREDIT' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                                    {tx.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(tx.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
