"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { ActionButton } from "@/components/buttons/ActionButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Fallback to sonner
import confetti from "canvas-confetti";
import { api } from "@/lib/api";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentModalProps {
    trigger?: React.ReactNode;
    onSuccess: () => void;
}

export function PaymentModal({ trigger, onSuccess }: PaymentModalProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const isTestMode = keyId?.startsWith("rzp_test");

    useEffect(() => {
        // Load Razorpay Script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const triggerPaymentConfetti = () => {
        // Main confetti burst
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#3B82F6', '#10B981', '#F59E0B'],
            ticks: 300,
            gravity: 1,
            scalar: 1.3
        });

        // Coin drop effect (delayed)
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0.4, y: 0.3 },
                colors: ['#FFD700', '#FFA500'],
                shapes: ['circle'],
                scalar: 0.8
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 0.6, y: 0.3 },
                colors: ['#FFD700', '#FFA500'],
                shapes: ['circle'],
                scalar: 0.8
            });
        }, 150);
    };

    const handlePayment = async () => {
        const value = parseInt(amount);
        if (isNaN(value) || value < 100) {
            toast.error("Amount must be at least ₹100");
            throw new Error("Invalid amount");
        }

        if (!keyId) {
            toast.error("Payment configuration missing");
            throw new Error("Razorpay Key ID missing");
        }

        setLoading(true);
        try {
            const orderRes = await api.post<{ orderId: string, keyId?: string }>('/payment/topup/init', { amount: value });
            const orderId = orderRes.orderId;
            const dynamicKeyId = orderRes.keyId || keyId;

            // 2. Open Razorpay Checkout
            const options = {
                key: dynamicKeyId,
                amount: value * 100, // Amount in paisa
                currency: "INR",
                name: "Doodhly",
                description: "Wallet Recharge",
                image: "https://doodhly.com/logo.png", // Replace with real logo
                order_id: orderId, // Fetched from backend!
                handler: function (response: any) {
                    // Payment is verified on the backend via Webhook.
                    // But we can trigger immediate visual success here.

                    // 🎊 Trigger confetti celebration!
                    triggerPaymentConfetti();

                    toast.success("Payment Processing! Your balance will update shortly.");
                    onSuccess();
                    setOpen(false);
                },
                prefill: {
                    name: "Doodhly Customer",
                    contact: "9999999999" // TODO: Add Auth Context if needed
                },
                notes: {
                    address: "Doodhly Milk Delivery"
                },
                theme: {
                    color: "#3399cc" // Brand blue roughly
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                toast.error("Payment Failed: " + response.error.description);
            });
            rzp1.open();
        } catch (error: any) {
            toast.error(error.message || "Failed to initialize payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Add Money</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Money to Wallet</DialogTitle>
                </DialogHeader>

                {isTestMode && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded relative mb-4" role="alert">
                        <strong className="font-bold">TEST MODE</strong>
                        <span className="block sm:inline"> - No real money will be deducted.</span>
                    </div>
                )}

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount (₹)
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                            placeholder="Min ₹100"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        {[100, 500, 1000].map((val) => (
                            <Button
                                key={val}
                                variant="outline"
                                size="sm"
                                onClick={() => setAmount(val.toString())}
                            >
                                ₹{val}
                            </Button>
                        ))}
                    </div>
                </div>

                <ActionButton
                    action={handlePayment}
                    className="w-full"
                // Intentionally not setting onSuccess here as it's handled in Razorpay callback
                >
                    Proceed to Pay
                </ActionButton>
            </DialogContent>
        </Dialog>
    );
}
