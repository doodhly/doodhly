"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const { refreshSession } = useAuth();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        if (!authLoading && user) {
            // If user has no name, they must complete onboarding
            if (!user.name && user.role === 'CUSTOMER') {
                router.push("/app/onboarding");
                return;
            }

            const destination = user.role === 'ADMIN' ? '/admin' :
                user.role === 'DELIVERY_PARTNER' ? '/partner' :
                    '/app/dashboard';
            router.push(destination);
        }
    }, [user, authLoading, router]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/otp', { phone });
            setStep("OTP");
            setResendCooldown(30); // Start 30s cooldown

            // DEV MODE BYPASS: Auto-fill and submit 1234
            if (process.env.NODE_ENV === 'development') {
                setOtp('1234');
                // We use setTimeout to allow state to update before submitting
                setTimeout(() => {
                    const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                    handleVerifyOtp(fakeEvent, '1234');
                }, 500);
            }
        } catch (error: any) {
            alert(`Failed to send OTP: ${error.message || 'Please try again.'}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            await api.post('/auth/otp', { phone });
            setResendCooldown(30);
            alert("OTP Resent Successfully!");
        } catch (error) {
            alert("Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent, devOtp?: string) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalOtp = devOtp || otp;
            const response = await api.post<{ isNewUser?: boolean, accessToken: string }>('/auth/login', { phone, otp: finalOtp });

            // Save Token
            if (response.accessToken) {
                localStorage.setItem('token', response.accessToken);
                // Force AuthContext to update immediately
                await refreshSession();
            }

            if (response.isNewUser) {
                router.push("/app/onboarding");
            } else {
                const targetUser = (await api.get<any>('/auth/me')); // Refresh role info
                const destination = targetUser.role === 'ADMIN' ? '/admin' :
                    targetUser.role === 'DELIVERY_PARTNER' ? '/partner/route' :
                        '/app/dashboard';
                router.push(destination);
            }
        } catch (error) {
            alert("Invalid OTP or Login Failed");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream/30">
                <Loader2 className="animate-spin text-brand-blue" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-cream via-white to-brand-blue/5">
            <GlassCard className="w-full max-w-md p-8 md:p-10 shadow-2xl border-white/60">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex justify-center mb-8">
                        <div className="h-16 w-16 bg-brand-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="font-serif text-3xl font-bold text-brand-blue mb-2">Welcome to Doodhly</h1>
                        <p className="text-gray-500">
                            {step === "PHONE" ? "Enter your mobile number to login or create a new account" : `Enter OTP sent to +91 ${phone}`}
                        </p>
                    </div>

                    {step === "PHONE" ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Mobile Number</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">+91</span>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="block w-full h-14 pl-14 pr-4 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all text-lg font-medium text-brand-blue placeholder:text-gray-300"
                                        placeholder="98765 43210"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-semibold text-lg shadow-lg shadow-brand-blue/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Get OTP"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">One Time Password</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    className="block w-full h-14 text-center rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all text-2xl tracking-widest font-bold text-brand-blue placeholder:text-gray-300"
                                    placeholder="• • • • • •"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl font-semibold text-lg shadow-lg shadow-brand-green/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Verify & Login"}
                            </button>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    disabled={resendCooldown > 0 || loading}
                                    onClick={handleResendOtp}
                                    className={cn(
                                        "w-full text-sm font-bold transition-all flex items-center justify-center gap-2",
                                        resendCooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-brand-blue hover:text-brand-blue/80"
                                    )}
                                >
                                    Resend OTP {resendCooldown > 0 && `(Wait ${resendCooldown}s)`}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep("PHONE")}
                                    className="w-full text-sm text-gray-500 hover:text-brand-blue font-medium transition-colors"
                                >
                                    Change Number
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 text-center text-xs text-gray-400">
                        By continuing, you agree to our <Link href="/terms" className="underline hover:text-brand-blue">Terms</Link> & <Link href="/privacy" className="underline hover:text-brand-blue">Privacy Policy</Link>
                    </div>
                </motion.div>
            </GlassCard>
        </div>
    );
}
