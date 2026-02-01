"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
    Loader2,
    ArrowRight,
    MapPin,
    Users,
    Milk,
    MessageSquare,
    CheckCircle2,
    Mail,
    User,
    ArrowLeft,
    Navigation
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import MapPicker from "@/components/MapPicker";
import { useGeolocation } from "@/hooks/useGeolocation";
import { reverseGeocode } from "@/lib/geo";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
    const router = useRouter();
    const { user, refreshSession } = useAuth();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        whatsapp_number: "",
        sameAsMobile: true,
        household_size: 2,
        daily_milk_liters: 1.0,
        address: {
            street: "",
            city: "Sakti",
            zip: "",
            lat: null as number | null,
            lng: null as number | null,
            accuracy: null as number | null
        }
    });

    const { getPosition, stopTracking, loading: geoLoading, accuracy: geoAccuracy, coords, error: geoError } = useGeolocation();

    useEffect(() => {
        if (user && formData.sameAsMobile) {
            setFormData(prev => ({ ...prev, whatsapp_number: user.phone }));
        }
    }, [user, formData.sameAsMobile]);

    const handleReverseGeocode = async (lat: number, lng: number) => {
        const result = await reverseGeocode(lat, lng);
        if (result) {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    street: result.street || result.display_name.split(',')[0] || prev.address.street,
                    city: result.city || prev.address.city,
                    zip: result.pincode || prev.address.zip
                }
            }));
        }
    };

    useEffect(() => {
        if (coords) {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    lat: coords.latitude,
                    lng: coords.longitude,
                    accuracy: geoAccuracy
                }
            }));
            handleReverseGeocode(coords.latitude, coords.longitude);
        }
    }, [coords, geoAccuracy]);

    const handleMapSelect = useCallback((lat: number, lng: number, accuracy: number | null) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                lat,
                lng,
                accuracy: accuracy || prev.address.accuracy
            }
        }));
        // If it's a manual pin drop (accuracy is null), try to get the street name
        if (accuracy === null) {
            handleReverseGeocode(lat, lng);
        }
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/auth/onboarding', formData);
            await refreshSession();
            router.push("/app/dashboard");
        } catch (error) {
            console.error("Onboarding failed", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        stopTracking();
        setStep(prev => (prev + 1) as Step);
    };
    const prevStep = () => {
        stopTracking();
        setStep(prev => (prev - 1) as Step);
    };

    const renderProgress = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
                <div
                    key={s}
                    className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        step === s ? "w-8 bg-brand-blue" : "w-2 bg-slate-200"
                    )}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-cream via-white to-brand-blue/5">
            <GlassCard className="w-full max-w-xl p-8 md:p-12 shadow-2xl border-white/60 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Milk size={120} className="text-brand-blue" />
                </div>

                {renderProgress()}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h1 className="font-serif text-3xl font-bold text-brand-blue mb-2">Basic Info</h1>
                                <p className="text-gray-500 text-sm">Let's get to know you better</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5 ml-1">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">WhatsApp Number</label>
                                        <button
                                            onClick={() => setFormData({ ...formData, sameAsMobile: !formData.sameAsMobile })}
                                            className="text-[10px] font-bold text-brand-blue hover:underline"
                                        >
                                            {formData.sameAsMobile ? "Use different number" : "Same as Login"}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            disabled={formData.sameAsMobile}
                                            value={formData.whatsapp_number}
                                            onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                            className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all disabled:opacity-50"
                                            placeholder="98765 43210"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={nextStep}
                                disabled={!formData.name}
                                className="w-full h-14 bg-brand-blue text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 group transition-all active:scale-95"
                            >
                                Continue <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h1 className="font-serif text-3xl font-bold text-brand-blue mb-2">Requirements</h1>
                                <p className="text-gray-500 text-sm">Help us understand your daily needs</p>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Household Size</p>
                                            <p className="text-lg font-bold text-brand-blue">{formData.household_size} People living at home</p>
                                        </div>
                                    </div>
                                    <input
                                        type="range" min="1" max="10" step="1"
                                        value={formData.household_size}
                                        onChange={e => setFormData({ ...formData, household_size: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] font-black text-slate-300">
                                        <span>MIN: 1</span>
                                        <span>MAX: 10+</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center">
                                            <Milk size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Daily Requirement</p>
                                            <p className="text-lg font-bold text-brand-green">{formData.daily_milk_liters} Liters / Day</p>
                                        </div>
                                    </div>
                                    <input
                                        type="range" min="0.5" max="5.0" step="0.5"
                                        value={formData.daily_milk_liters}
                                        onChange={e => setFormData({ ...formData, daily_milk_liters: parseFloat(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-green"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] font-black text-slate-300">
                                        <span>MIN: 0.5L</span>
                                        <span>MAX: 5L+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={prevStep} className="w-20 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <ArrowLeft size={24} />
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="flex-1 h-14 bg-brand-blue text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    Last Step <ArrowRight />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h1 className="font-serif text-3xl font-bold text-brand-blue mb-2">Delivery Address</h1>
                                <p className="text-gray-500 text-sm">Where should we deliver your freshness?</p>
                            </div>

                            <div className="space-y-4">
                                <MapPicker
                                    initialLat={formData.address.lat || undefined}
                                    initialLng={formData.address.lng || undefined}
                                    onLocationSelect={handleMapSelect}
                                    accuracy={formData.address.accuracy}
                                />

                                <button
                                    type="button"
                                    onClick={() => getPosition({ enableHighAccuracy: true, timeout: 15000 }, true)}
                                    disabled={geoLoading}
                                    className={cn(
                                        "w-full h-14 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all font-bold",
                                        formData.address.accuracy && formData.address.accuracy <= 50
                                            ? "bg-green-50 border-green-200 text-green-600"
                                            : "bg-brand-blue/5 border-brand-blue/20 text-brand-blue hover:bg-brand-blue/10"
                                    )}
                                >
                                    {geoLoading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>
                                            <Navigation size={18} />
                                            {formData.address.accuracy ? "Relocate Me" : "Use High-Precision GPS"}
                                        </>
                                    )}
                                </button>

                                {geoError && (
                                    <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 italic">
                                        ⚠️ {geoError}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Street / Landmark / Gate</label>
                                <input
                                    required
                                    value={formData.address.street}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                    className="w-full h-14 px-4 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all"
                                    placeholder="Flat No, Wing, Society Name"
                                />
                                <p className="mt-1.5 ml-1 text-[10px] text-slate-400 italic">Pre-filled from map pin. Please edit if needed.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={prevStep} className="w-20 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <ArrowLeft size={24} />
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.address.street}
                                    className="flex-1 h-14 bg-brand-green text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                        <>
                                            Complete Profile <CheckCircle2 size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
}
