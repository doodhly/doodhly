"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { ShieldCheck, ArrowRight, Loader2, Sparkles, Phone } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { fadeUp, smoothEase, staggerContainer } from "@/lib/motion";

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
            // Prepend +91 to match E.164 format required by backend
            const fullPhone = `+91${phone}`;
            await api.post('/auth/otp', { phone: fullPhone });
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
            const fullPhone = `+91${phone}`;
            await api.post('/auth/otp', { phone: fullPhone });
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
            const fullPhone = `+91${phone}`;
            const response = await api.post<{ isNewUser?: boolean, accessToken: string }>('/auth/login', { phone: fullPhone, otp: finalOtp });

            // Save Token
            if (response.accessToken) {
                localStorage.setItem('token', response.accessToken);
                document.cookie = `jwt=${response.accessToken}; path=/; secure; samesite=strict`;

                // Refresh auth context
                await refreshSession();

                // Redirect logic handled by useEffect
            }
        } catch (error: any) {
            alert(`Login Failed: ${error.message || 'Invalid OTP'}`);
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
        <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
            <m.div
                key="login-page"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={staggerContainer}
                className="w-full min-h-screen flex items-center justify-center bg-brand-cream px-6 selection:bg-brand-green selection:text-white relative overflow-hidden"
            >

                {/* Background Texture/Gradient for the page body to make the card pop */}
                <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent" />

                {/* Main Card Container */}
                <m.div
                    variants={fadeUp}
                    className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden bg-white relative z-10 min-h-[600px]"
                >

                    {/* Left Side - Visual (Hidden on mobile) */}
                    <div className="hidden md:block relative overflow-hidden bg-brand-blue/5">
                        <m.div
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: smoothEase }}
                            className="absolute inset-0 z-0 transform-gpu will-change-transform"
                        >
                            <Image
                                src="/images/login-bg.webp"
                                alt="Fresh milk delivery"
                                fill
                                sizes="100vw"
                                className="object-cover object-center"
                            />
                        </m.div>

                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/80 via-brand-blue/60 to-brand-blue/80 z-10" />

                        {/* Animated Background blobs for Blue Side */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                            <m.div
                                animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-70"
                            />
                            <m.div
                                animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
                                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-0 right-0 w-80 h-80 bg-brand-green/10 rounded-full blur-3xl opacity-60"
                            />
                        </div>

                        {/* Content */}
                        <m.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative z-30 p-8 lg:p-12 flex flex-col justify-center h-full max-w-md w-full text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-semibold mb-6 w-fit">
                                <Sparkles className="w-4 h-4 text-brand-green" />
                                <span>Join 500+ happy families</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                Pure Milk, <br />
                                <span className="text-brand-green">Straight to Home.</span>
                            </h1>
                            <p className="text-lg text-blue-100/80 mb-8 leading-relaxed">
                                Log in to manage your subscription, track deliveries in real-time, and enjoy farm-fresh goodness every morning.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {[
                                    "No Preservatives",
                                    "Free Delivery",
                                    "Pause Anytime"
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-white/90 font-medium">
                                        <ShieldCheck className="w-5 h-5 text-brand-green" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </m.div>
                    </div>

                    {/* Right Side - Form (Cream) */}
                    <div className="bg-brand-cream relative flex items-center justify-center p-8 lg:p-12 min-h-full">
                        {/* Animated Background blobs for Cream Side */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                            <m.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-20 left-1/4 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-3xl"
                            />
                        </div>

                        <m.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="w-full max-w-md relative z-10"
                        >
                            <GlassCard className="w-full p-8 md:p-10 shadow-2xl shadow-brand-blue/10" tilt intensity="medium">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-brand-blue mb-2">Welcome Back</h2>
                                    <p className="text-brand-blue/60">Enter your mobile number to continue</p>
                                </div>

                                {step === "PHONE" && (
                                    <m.form
                                        key="phone-form"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        onSubmit={handleSendOtp}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <label htmlFor="login-phone" className="text-sm font-semibold text-brand-blue/80 ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue/50 font-medium flex items-center gap-2 border-r border-brand-blue/10 pr-2">
                                                    <span>🇮🇳</span>
                                                    <span>+91</span>
                                                </div>
                                                <input
                                                    id="login-phone"
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    className="w-full pl-24 pr-4 py-4 bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all font-medium text-lg text-brand-blue placeholder:text-brand-blue/30"
                                                    placeholder="98765 43210"
                                                    required
                                                />
                                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-blue/30 group-focus-within:text-brand-blue/60 transition-colors" />
                                            </div>
                                        </div>
                                        <MagneticButton>
                                            <button
                                                type="submit"
                                                disabled={loading || phone.length !== 10}
                                                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                                            >
                                                {loading ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <>
                                                        Send OTP
                                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </MagneticButton>
                                    </m.form>
                                )}

                                {step === "OTP" && (
                                    <m.form
                                        key="otp-form"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        onSubmit={handleVerifyOtp}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label htmlFor="login-otp" className="text-sm font-semibold text-brand-blue/80">Enter OTP</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setStep("PHONE")}
                                                    className="text-xs text-brand-blue/60 hover:text-brand-blue font-medium underline decoration-brand-blue/30 underline-offset-2"
                                                >
                                                    Change Number
                                                </button>
                                            </div>
                                            <input
                                                id="login-otp"
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                className="w-full px-4 py-4 bg-white/50 border border-white/60 rounded-xl text-center text-3xl font-bold tracking-[0.5em] text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all"
                                                placeholder="••••"
                                                required
                                            />
                                        </div>

                                        <MagneticButton>
                                            <button
                                                type="submit"
                                                disabled={loading || otp.length !== 4}
                                                className="w-full bg-brand-green hover:bg-brand-green-light text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
                                            </button>
                                        </MagneticButton>

                                        <div className="text-center">
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={resendCooldown > 0 || loading}
                                                className="text-sm text-brand-blue/60 hover:text-brand-blue font-medium disabled:opacity-50 transition-colors"
                                            >
                                                {resendCooldown > 0
                                                    ? `Resend OTP in ${resendCooldown}s`
                                                    : "Didn't receive code? Resend"}
                                            </button>
                                        </div>
                                    </m.form>
                                )}

                                <div className="mt-8 pt-6 border-t border-brand-blue/10 text-center">
                                    <Link href="/" className="text-brand-blue/50 hover:text-brand-blue text-sm font-medium transition-colors">
                                        ← Back to Home
                                    </Link>
                                </div>
                            </GlassCard>
                        </m.div>
                    </div>
                </m.div>
            </m.div>
        </AnimatePresence>
        </LazyMotion>
    );
}
