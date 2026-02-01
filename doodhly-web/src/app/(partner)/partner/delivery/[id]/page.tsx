"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RunSheetItem, verifyDelivery, reportIssue } from "@/lib/deliveries";
import { addToQueue } from "@/lib/offline-queue";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function DeliveryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isOnline } = useOfflineSync();
    const [delivery, setDelivery] = useState<RunSheetItem | null>(null);
    const [couponCode, setCouponCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [showReasons, setShowReasons] = useState(false);

    useEffect(() => {
        // Load from local storage for speed/offline support
        const cached = localStorage.getItem("current_route");
        if (cached) {
            const list: RunSheetItem[] = JSON.parse(cached);
            const found = list.find(d => d.id === params.id);
            if (found) setDelivery(found);
        }
    }, [params.id]);

    if (!delivery) return <div className="text-white p-4">Loading stop...</div>;

    const handleVerify = async () => {
        if (!couponCode || couponCode.length < 4) return;
        setLoading(true);
        try {
            if (isOnline) {
                await verifyDelivery(delivery.id, couponCode);
            } else {
                addToQueue({
                    id: crypto.randomUUID(),
                    type: "VERIFY",
                    deliveryId: delivery.id,
                    payload: { code: couponCode },
                    timestamp: Date.now()
                });
            }
            updateLocalStatus("DELIVERED");
            router.back();
        } catch (err) {
            alert("Verification failed. Please check the code.");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async (reason: string) => {
        setLoading(true);
        try {
            if (isOnline) {
                await reportIssue(delivery.id, reason);
            } else {
                addToQueue({
                    id: crypto.randomUUID(),
                    type: "REPORT",
                    deliveryId: delivery.id,
                    payload: { reason },
                    timestamp: Date.now()
                });
            }
            updateLocalStatus("MISSED");
            router.back();
        } catch (err) {
            alert("Failed to report issue");
        } finally {
            setLoading(false);
            setShowReasons(false);
        }
    };

    const updateLocalStatus = (status: any) => {
        const cached = localStorage.getItem("current_route");
        if (cached) {
            const list: RunSheetItem[] = JSON.parse(cached);
            const idx = list.findIndex(d => d.id === delivery.id);
            if (idx !== -1) {
                list[idx].status = status;
                localStorage.setItem("current_route", JSON.stringify(list));
            }
        }
    };

    const isLocked = delivery.status !== "PENDING";

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans pb-safe">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-slate-900 sticky top-0 z-10">
                <button
                    onClick={() => router.back()}
                    className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 active:bg-white/10 transition-colors"
                >
                    <span className="text-2xl">←</span>
                </button>
                <div className="flex-1 overflow-hidden">
                    <h1 className="text-xl font-bold leading-tight truncate">{delivery.customerName}</h1>
                    <p className="text-xs text-slate-400 truncate uppercase tracking-wider">{delivery.address}</p>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
            </div>

            <div className="flex-1 p-4 space-y-6 max-w-lg mx-auto w-full">
                {/* Product Card - Huge Focus */}
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">ITEM TO DELIVER</h2>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                        <span className="text-2xl font-bold text-white">{delivery.productName}</span>
                        <div className="flex flex-col items-end">
                            <span className="text-4xl font-black text-brand-blue">{delivery.quantity}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{delivery.unit}</span>
                        </div>
                    </div>
                </div>

                {!isLocked ? (
                    <div className="space-y-6">
                        <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-lg">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">SECURE DELIVERY CODE</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                placeholder="----"
                                className="w-full bg-black/40 border-2 border-slate-800 rounded-2xl p-6 text-5xl text-center tracking-[1rem] text-white focus:border-brand-blue outline-none transition-all placeholder:text-slate-800 font-mono shadow-inner"
                                value={couponCode}
                                onChange={e => setCouponCode(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleVerify}
                                disabled={couponCode.length < 4 || loading}
                                className="w-full bg-brand-blue active:scale-[0.98] disabled:opacity-20 disabled:grayscale text-white font-black h-20 rounded-2xl text-xl shadow-2xl shadow-brand-blue/30 transition-all flex items-center justify-center uppercase tracking-widest"
                            >
                                {loading ? "Verifying..." : "Confirm Delivery"}
                            </button>

                            <button
                                onClick={() => setShowReasons(true)}
                                disabled={loading}
                                className="w-full py-4 text-slate-500 font-bold text-sm uppercase tracking-wider hover:text-slate-300 transition-colors"
                            >
                                Problem? Skip or Report
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={`bg-${delivery.status === 'DELIVERED' ? 'green' : 'red'}-500/10 border border-${delivery.status === 'DELIVERED' ? 'green' : 'red'}-500/50 p-10 rounded-3xl text-center backdrop-blur-md`}>
                        <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full bg-${delivery.status === 'DELIVERED' ? 'green' : 'red'}-500 text-white text-4xl mb-6 shadow-2xl shadow-${delivery.status === 'DELIVERED' ? 'green' : 'red'}-500/40 animate-in zoom-in duration-300`}>
                            {delivery.status === 'DELIVERED' ? '✓' : '!'}
                        </div>
                        <p className={`text-${delivery.status === 'DELIVERED' ? 'green' : 'red'}-400 font-black text-2xl uppercase tracking-[0.1em]`}>
                            {delivery.status}
                        </p>
                        <p className="text-slate-500 text-sm mt-2">Submission Locked</p>
                    </div>
                )}
            </div>

            {/* Reasons Bottom Sheet */}
            {showReasons && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 shadow-2xl border border-white/10 animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Reporting Issue</h3>
                            <button onClick={() => setShowReasons(false)} className="text-slate-500">Close</button>
                        </div>
                        <div className="space-y-3">
                            {["CUSTOMER_UNAVAILABLE", "DOOR_LOCKED", "PAYMENT_ISSUE", "PRODUCT_DAMAGED", "WRONG_ADDRESS"].map(r => (
                                <button
                                    key={r}
                                    onClick={() => handleSkip(r)}
                                    className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-xl text-left font-bold text-slate-300 flex justify-between items-center transition-colors"
                                >
                                    {r.replace(/_/g, ' ')}
                                    <span className="text-xl">›</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
