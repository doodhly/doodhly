"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, Calendar as CalendarIcon, Leaf } from "lucide-react";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <div className="flex flex-col pb-16 overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-brand-cream">
                {/* Abstract Background Meshes */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-3xl" />

                <div className="container relative z-10 flex flex-col items-center gap-8 text-center px-4 pt-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center rounded-full border border-brand-blue/10 bg-white/60 backdrop-blur px-4 py-1.5 text-sm font-medium text-brand-blue shadow-sm"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-brand-green mr-2 animate-pulse"></span>
                        Now delivering in Sakti
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-serif text-5xl font-bold tracking-tight text-brand-blue sm:text-7xl md:text-8xl max-w-5xl leading-[1.1]"
                    >
                        Pure, Fresh Milk <br className="hidden sm:inline" />
                        <span className="text-brand-green italic">Straight from Farm.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-2xl leading-relaxed text-gray-600 sm:text-xl sm:leading-9"
                    >
                        Experience the taste of unadulterated cow milk. No preservatives,
                        just nature's goodness delivered to your doorstep by 10 AM.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto"
                    >
                        <Link
                            href="/login"
                            className="inline-flex h-14 items-center justify-center rounded-full bg-brand-blue px-10 text-lg font-semibold text-white shadow-xl shadow-brand-blue/20 transition-all hover:bg-brand-blue/90 hover:scale-[1.02] active:scale-95 duration-200"
                        >
                            Subscribe Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="/products"
                            className="inline-flex h-14 items-center justify-center rounded-full border border-gray-200 bg-white/80 backdrop-blur px-10 text-lg font-medium text-gray-900 shadow-sm transition-colors hover:bg-white hover:text-brand-blue"
                        >
                            View Products
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container px-4 py-24 relative z-20 -mt-20">
                <div className="grid gap-6 md:grid-cols-3">
                    <GlassCard hoverEffect>
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/5 text-brand-blue">
                            <ShieldCheck className="h-7 w-7" />
                        </div>
                        <h3 className="mb-3 font-serif text-2xl font-bold text-brand-blue">Lab Tested Purity</h3>
                        <p className="text-gray-600 leading-relaxed">Every batch is tested for 26 parameters including adulteration and antibiotics.</p>
                    </GlassCard>

                    <GlassCard hoverEffect>
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                            <Leaf className="h-7 w-7" />
                        </div>
                        <h3 className="mb-3 font-serif text-2xl font-bold text-brand-blue">Preservative Free</h3>
                        <p className="text-gray-600 leading-relaxed">Chilled within 20 minutes of milking and delivered in a continuous cold chain.</p>
                    </GlassCard>

                    <GlassCard hoverEffect>
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                            <CalendarIcon className="h-7 w-7" />
                        </div>
                        <h3 className="mb-3 font-serif text-2xl font-bold text-brand-blue">Flexible Plan</h3>
                        <p className="text-gray-600 leading-relaxed">Pause, resume, or modify your daily quantity anytime via our app before 8 PM.</p>
                    </GlassCard>
                </div>
            </section>

            {/* Service & Map Section */}
            <section className="container px-4 py-12">
                <GlassCard className="p-8 md:p-12 bg-white/60 border-brand-blue/5">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="space-y-4">
                                <h2 className="font-serif text-4xl font-bold text-brand-blue">Delivering in Sakti</h2>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    We currently serve all major neighborhoods. Check if your home is in our fresh zone.
                                </p>
                            </div>

                            <ul className="grid grid-cols-2 gap-4">
                                {['Station Road', 'Civil Lines', 'Baradwar Road', 'Main Market', 'Hospital Area', 'College Road'].map(area => (
                                    <li key={area} className="flex items-center text-gray-700 bg-white/50 p-3 rounded-lg border border-gray-100">
                                        <div className="h-2 w-2 rounded-full bg-brand-green mr-3 shadow-[0_0_8px_rgba(67,160,71,0.5)]"></div>
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2 w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-white/50">
                            <MapEmbed />
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* How It Works - Visual Steps */}
            <section className="container px-4 py-24">
                <div className="bg-brand-blue rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-16 relative z-10">Simple Steps to Freshness</h2>

                    <div className="grid gap-12 md:grid-cols-3 relative z-10">
                        {[
                            { step: "01", title: "Subscribe", desc: "Choose your milk quantity and schedule (Daily/Alternate)." },
                            { step: "02", title: "Recharge", desc: "Top up your wallet. Money is deducted only on successful delivery." },
                            { step: "03", title: "Enjoy", desc: "Wake up to fresh milk at your doorstep every morning by 10 AM." }
                        ].map((item, i) => (
                            <div key={i} className="group space-y-6">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-3xl font-bold backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-300">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-bold">{item.title}</h3>
                                <p className="text-blue-100 text-lg max-w-xs mx-auto">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
