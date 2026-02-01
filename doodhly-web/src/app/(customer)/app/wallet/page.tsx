"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, ArrowDownLeft, ArrowUpRight, History, Wallet as WalletIcon, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface WalletData {
    id: string;
    balance: number;
    currency: string;
}

interface LedgerEntry {
    id: string;
    amount: number;
    direction: "CREDIT" | "DEBIT";
    type: string;
    reference_id: string;
    created_at: string;
}

export default function WalletPage() {
    const { user, loading: authLoading } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;

        const fetchWalletData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch wallet balance
                const walletRes = await api.get<WalletData>('/customer/wallet');
                setBalance(walletRes.balance);

                // Fetch ledger transactions
                const ledgerRes = await api.get<LedgerEntry[]>('/customer/wallet/ledger');
                setTransactions(ledgerRes || []);
            } catch (err: any) {
                console.error('Wallet fetch error:', err);
                setError(err.message || 'Failed to load wallet data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWalletData();
    }, [user, authLoading]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'RECHARGE': return 'Wallet Recharge';
            case 'ORDER_DEDUCTION': return 'Milk Delivery';
            case 'ROLLOVER_REFUND': return 'Refund';
            default: return type.replace(/_/g, ' ');
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-brand-blue">My Wallet</h1>
                    <p className="text-gray-500">Manage your balance and transactions.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5 gap-2">
                        <History className="w-4 h-4" />
                        Statements
                    </Button>
                </div>
            </header>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Balance Card */}
            <GlassCard className="p-8 bg-gradient-to-br from-brand-blue to-blue-900 text-white border-none shadow-xl shadow-blue-900/20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div>
                        <p className="text-blue-200 mb-1 font-medium flex items-center gap-2">
                            <WalletIcon className="w-4 h-4" /> Available Balance
                        </p>
                        <div className="font-serif text-5xl md:text-6xl font-bold tracking-tight">
                            ₹{balance !== null ? balance : '--'}
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="bg-white text-brand-blue hover:bg-blue-50 border-none shadow-none font-bold"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Money
                    </Button>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
            </GlassCard>

            {/* Transactions */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 px-1">Recent Activity</h2>

                {transactions.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                        <WalletIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No transactions yet</p>
                        <p className="text-gray-400 text-sm">Your wallet activity will appear here</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.direction === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {tx.direction === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{getTypeLabel(tx.type)}</p>
                                        <p className="text-sm text-gray-400">{formatDate(tx.created_at)}</p>
                                    </div>
                                </div>
                                <span className={`font-bold text-lg ${tx.direction === 'CREDIT' ? 'text-green-600' : 'text-gray-900'
                                    }`}>
                                    {tx.direction === 'CREDIT' ? '+' : '-'}₹{Math.abs(tx.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
