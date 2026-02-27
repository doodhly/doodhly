"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { BrutalInput } from "@/components/brutal/BrutalInput";
import { ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { refreshSession, user, loading: authLoading } = useAuth();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && user) {
            const destination = user.role === 'ADMIN' ? '/admin' :
                user.role === 'DELIVERY_PARTNER' ? '/partner' :
                    '/app/dashboard';
            router.push(destination);
        }
    }, [user, authLoading, router]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const fullPhone = `+91${phone}`;
            await api.post('/auth/otp', { phone: fullPhone });
            setStep("OTP");
            if (process.env.NODE_ENV === 'development') {
                setOtp('1234');
            }
        } catch (error: any) {
            setError(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const fullPhone = `+91${phone}`;
            const response = await api.post<{ accessToken: string }>('/auth/login', { phone: fullPhone, otp });

            if (response.accessToken) {
                localStorage.setItem('token', response.accessToken);
                document.cookie = `jwt=${response.accessToken}; path=/; secure; samesite=strict`;
                await refreshSession();
            }
        } catch (error: any) {
            setError(error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center font-black text-4xl bg-brutal-bg uppercase">LOADING...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-brutal-blue relative overflow-hidden">

            {/* Background shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-brutal-noise pointer-events-none"></div>
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-brutal-yellow border-4 border-black rounded-full mix-blend-hard-light"></div>
            <div className="absolute top-1/2 -right-20 w-80 h-80 bg-brutal-pink border-4 border-black transform rotate-45"></div>

            <BrutalCard className="w-full max-w-lg bg-white relative z-10 shadow-[12px_12px_0px_#000] border-4 p-8 md:p-12">
                <div className="mb-12 border-b-4 border-black pb-6">
                    <h1 className="font-sans font-black text-6xl mb-2">LOGIN.</h1>
                    <p className="font-mono font-bold text-sm uppercase tracking-widest text-gray-500">
                        {step === "PHONE" ? "Enter your digits" : "Prove it's you"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-error text-white font-bold p-4 border-4 border-black shadow-[4px_4px_0px_#000]">
                        ⚠ {error.toUpperCase()}
                    </div>
                )}

                {step === "PHONE" && (
                    <form onSubmit={handleSendOtp} className="space-y-8">
                        <BrutalInput
                            label="Phone Number"
                            placeholder="98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="text-2xl h-16"
                        />
                        <div className="text-xs font-mono font-bold uppercase text-gray-500 text-right">
                            We'll text you a code. No spam.
                        </div>
                        <BrutalButton type="submit" className="w-full text-xl h-16 shadow-[6px_6px_0px_#000]" disabled={loading || phone.length !== 10} isLoading={loading}>
                            {loading ? "SENDING..." : <>SEND OTP <ArrowRight className="ml-2 w-6 h-6" strokeWidth={3} /></>}
                        </BrutalButton>
                    </form>
                )}

                {step === "OTP" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                        <BrutalInput
                            label="Security Code"
                            placeholder="••••"
                            className="text-center text-5xl tracking-[0.5em] h-24 font-black"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        />
                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => { setStep("PHONE"); setError(""); }}
                                className="text-xs font-mono font-bold underline hover:bg-black hover:text-white px-1"
                            >
                                WRONG NUMBER?
                            </button>
                            <span className="text-xs font-mono font-bold text-gray-400">4 DIGITS</span>
                        </div>

                        <BrutalButton type="submit" variant="primary" className="w-full text-xl h-16 shadow-[6px_6px_0px_#000]" disabled={loading || otp.length !== 4} isLoading={loading}>
                            <Lock className="mr-2 w-5 h-5" /> VERIFY & ENTER
                        </BrutalButton>
                    </form>
                )}
            </BrutalCard>
        </div>
    );
}
