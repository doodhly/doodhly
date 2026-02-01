"use client";

import { Subscription, pauseSubscription, resumeSubscription } from "@/lib/subscriptions";
import { formatCurrency, cn } from "@/lib/utils";
import { useState } from "react";

interface SubscriptionCardProps {
    subscription: Subscription;
    onRefresh: () => void;
}

export function SubscriptionCard({ subscription, onRefresh }: SubscriptionCardProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePause = async () => {
        if (!confirm("Are you sure you want to pause this subscription from tomorrow?")) return;
        setLoading(true);
        setError(null);
        try {
            // Default pause: From tomorrow until manually resumed
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const startDate = tomorrow.toISOString().split('T')[0];

            await pauseSubscription(subscription.id, startDate);
            onRefresh();
        } catch (err: any) {
            setError(err.message || "Failed to pause subscription");
        } finally {
            setLoading(false);
        }
    };

    const handleResume = async () => {
        setLoading(true);
        setError(null);
        try {
            await resumeSubscription(subscription.id);
            onRefresh();
        } catch (err: any) {
            setError(err.message || "Failed to resume subscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-brand-blue text-lg">{subscription.productName}</h3>
                    <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-bold",
                        subscription.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                            subscription.status === "PAUSED" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                    )}>
                        {subscription.status}
                    </span>
                </div>
                <p className="text-sm text-gray-500">
                    {subscription.quantity} Unit(s) • {formatCurrency(subscription.pricePerUnit * subscription.quantity)} / day
                </p>
                <p className="text-xs text-gray-400">
                    Next Delivery: {new Date(subscription.nextDeliveryDate).toLocaleDateString()}
                </p>
                {error && <p className="text-xs text-red-500 font-medium mt-2">⚠️ {error}</p>}
            </div>

            <div className="flex items-center gap-2">
                {subscription.status === "ACTIVE" && (
                    <button
                        onClick={handlePause}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "..." : "Pause"}
                    </button>
                )}
                {subscription.status === "PAUSED" && (
                    <button
                        onClick={handleResume}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "..." : "Resume"}
                    </button>
                )}
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg border">
                    Edit
                </button>
            </div>
        </div>
    );
}
