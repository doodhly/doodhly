"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSubscriptions, Subscription } from "@/lib/subscriptions";
import { SubscriptionCard } from "@/components/customer/SubscriptionCard";
import { Container } from "@/components/ui/Container";

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubs = async () => {
        setLoading(true);
        try {
            const data = await getSubscriptions();
            setSubscriptions(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load subscriptions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubs();
    }, []);

    return (
        <Container className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-serif text-brand-blue">My Subscriptions</h1>
                    <p className="text-sm text-gray-500">Manage your daily deliveries</p>
                </div>
                <Link
                    href="/app/subscriptions/new"
                    className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90"
                >
                    + Add New
                </Link>
            </header>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-8 text-gray-400">Loading...</div>
            ) : subscriptions.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 mb-4">No active subscriptions found.</p>
                    <button className="text-brand-blue font-bold hover:underline">Start a new subscription</button>
                </div>
            ) : (
                <div className="space-y-4">
                    {subscriptions.map((sub) => (
                        <SubscriptionCard key={sub.id} subscription={sub} onRefresh={fetchSubs} />
                    ))}
                </div>
            )}

        </Container >
    );
}
