"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NewSubscriptionPage() {
    const router = useRouter();
    const [pageState, setPageState] = useState<{
        availableProducts: any[];
        addresses: any[];
        balance: number;
        loading: boolean;
        error: string | null;
        submitting: boolean;
    }>({
        availableProducts: [],
        addresses: [],
        balance: 0,
        loading: true,
        error: null,
        submitting: false,
    });
    const [formData, setFormData] = useState({
        productId: "",
        addressId: "",
        quantity: 1,
        frequency: "DAILY",
        startDate: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, addressesRes, walletRes] = await Promise.all([
                    api.get<any[]>('/customer/products'),
                    api.get<any[]>('/customer/addresses'),
                    api.get<{ balance: number }>('/customer/wallet')
                ]);

                let initError: string | null = null;
                if (walletRes.balance < 100) {
                    initError = "Insufficient balance. Please recharge your wallet (min ₹100) before subscribing.";
                } else if (addressesRes.length === 0) {
                    initError = "No delivery address found. Please add an address in your profile first.";
                }

                setPageState(prev => ({
                    ...prev,
                    availableProducts: productsRes,
                    addresses: addressesRes,
                    balance: walletRes.balance,
                    loading: false,
                    error: initError,
                }));
            } catch (err: any) {
                console.error("Failed to load data", err);
                setPageState(prev => ({ ...prev, loading: false, error: "Initialization failed. Please try again." }));
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (pageState.loading) return;
        const defaultAddr = pageState.addresses.find((a: any) => a.is_default) || pageState.addresses[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData(prev => ({
            ...prev,
            productId: pageState.availableProducts.length > 0 ? pageState.availableProducts[0].id.toString() : "",
            addressId: defaultAddr ? defaultAddr.id.toString() : "",
            startDate: tomorrow.toISOString().split('T')[0]
        }));
    }, [pageState.loading, pageState.availableProducts, pageState.addresses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPageState(prev => ({ ...prev, submitting: true, error: null }));

        try {
            await api.post(API_ENDPOINTS.SUBSCRIPTIONS, {
                product_id: Number(formData.productId),
                address_id: Number(formData.addressId),
                quantity: Number(formData.quantity),
                frequency: formData.frequency,
                start_date: formData.startDate
            });
            router.push("/app/dashboard");
        } catch (err: any) {
            setPageState(prev => ({ ...prev, error: err.message || "Failed to create subscription", submitting: false }));
        }
    };

    if (pageState.loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow mt-8">
            <h1 className="text-xl font-serif font-bold text-brand-blue mb-6">New Subscription</h1>

            {pageState.error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex flex-col gap-3">
                    <p className="font-medium">{pageState.error}</p>
                    {pageState.balance < 100 && (
                        <Button variant="outline" size="sm" className="w-fit text-red-700 border-red-200 hover:bg-red-100" onClick={() => router.push('/app/wallet')}>
                            Recharge Wallet
                        </Button>
                    )}
                    {pageState.addresses.length === 0 && (
                        <Button variant="outline" size="sm" className="w-fit text-red-700 border-red-200 hover:bg-red-100" onClick={() => router.push('/app/addresses')}>
                            Add Address
                        </Button>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="subscription-product" className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                        id="subscription-product"
                        className="w-full border rounded-lg p-2 bg-white"
                        value={formData.productId}
                        onChange={e => setFormData({ ...formData, productId: e.target.value })}
                        required
                        disabled={pageState.balance < 100 || pageState.addresses.length === 0}
                    >
                        {pageState.availableProducts.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="subscription-address" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <select
                        id="subscription-address"
                        className="w-full border rounded-lg p-2 bg-white"
                        value={formData.addressId}
                        onChange={e => setFormData({ ...formData, addressId: e.target.value })}
                        required
                        disabled={pageState.balance < 100 || pageState.addresses.length === 0}
                    >
                        {pageState.addresses.map(a => (
                            <option key={a.id} value={a.id}>{a.city}: {a.street}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="subscription-quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                            id="subscription-quantity"
                            type="number"
                            min="1"
                            max="10"
                            className="w-full border rounded-lg p-2"
                            value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label htmlFor="subscription-frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                            id="subscription-frequency"
                            className="w-full border rounded-lg p-2 bg-white"
                            value={formData.frequency}
                            onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                        >
                            <option value="DAILY">Daily</option>
                            <option value="ALTERNATE">Alternate Days</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="subscription-start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                        id="subscription-start-date"
                        type="date"
                        required
                        className="w-full border rounded-lg p-2"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Deliveries start based on cutoff times.</p>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={pageState.submitting || pageState.balance < 100 || pageState.addresses.length === 0}
                        className="flex-1 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
                    >
                        {pageState.submitting ? "Creating..." : "Confirm"}
                    </button>
                </div>
            </form>
        </div>
    );
}
