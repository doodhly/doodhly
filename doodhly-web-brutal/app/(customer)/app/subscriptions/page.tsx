"use client";

import { useAuth } from "@/context/AuthContext";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { PauseCircle, PlayCircle, Trash2, Package } from "lucide-react";

interface Subscription {
    id: string;
    productName: string;
    quantity: number;
    frequency: string;
    status: string;
    nextDeliveryDate: string;
}

export default function SubscriptionsPage() {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubs = () => {
        setLoading(true);
        api.get<Subscription[]>('/customer/subscriptions')
            .then(setSubscriptions)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (user) fetchSubs();
    }, [user]);

    const toggleStatus = async (sub: Subscription) => {
        const action = sub.status === 'ACTIVE' ? 'pause' : 'resume';
        if (!confirm(`Confirm ${action.toUpperCase()} action for ${sub.productName}?`)) return;

        try {
            await api.patch(`/customer/subscriptions/${sub.id}/${action}`);
            fetchSubs();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20">
            <header className="mb-16 border-b-4 border-black pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="font-sans font-black text-6xl md:text-8xl mb-2 uppercase">My Stash.</h1>
                    <p className="font-mono font-bold text-gray-500 uppercase tracking-widest">Daily drops management</p>
                </div>
                <div className="font-mono font-bold text-xl bg-brutal-blue px-6 py-4 border-4 border-black shadow-[4px_4px_0px_#000] rotate-2">
                    {subscriptions.filter(s => s.status === 'ACTIVE').length} ACTIVE SUBS
                </div>
            </header>

            {loading && <div className="font-black text-4xl text-center uppercase">LOADING STASH...</div>}

            <div className="space-y-8">
                {subscriptions.map(sub => {
                    const isActive = sub.status === 'ACTIVE';
                    return (
                        <BrutalCard
                            key={sub.id}
                            color={isActive ? "bg-white" : "bg-gray-100"}
                            className={`flex flex-col md:flex-row justify-between items-center gap-8 border-4 shadow-[8px_8px_0px_#000] ${!isActive ? 'opacity-80 grayscale' : ''}`}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`p-6 border-4 border-black ${isActive ? 'bg-brutal-yellow' : 'bg-gray-200'}`}>
                                    <Package className="h-10 w-10 text-black" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="font-sans font-black text-3xl uppercase leading-none">{sub.productName}</h3>
                                        <span className={`font-mono font-bold text-xs uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000] ${isActive ? 'bg-success text-black' : 'bg-error text-white'}`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                    <p className="font-mono font-bold text-xl mb-1">
                                        {sub.quantity}L / {sub.frequency}
                                    </p>
                                    <p className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wide">
                                        Next Drop: {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto">
                                <BrutalButton
                                    variant="outline"
                                    onClick={() => toggleStatus(sub)}
                                    className="flex-1 md:flex-none border-4 hover:bg-black hover:text-white"
                                >
                                    {isActive ? <><PauseCircle className="mr-2" /> PAUSE</> : <><PlayCircle className="mr-2" /> RESUME</>}
                                </BrutalButton>
                            </div>
                        </BrutalCard>
                    );
                })}
            </div>
        </div>
    );
}
