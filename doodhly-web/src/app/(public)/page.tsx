"use client";

import { NavigateButton } from "@/components/buttons/NavigateButton";
import { useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
const Scene3D = dynamic(() => import("@/components/3d/Scene3D"), { ssr: false });
import MagneticButton from "@/components/ui/MagneticButton";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { fadeUp, smoothEase } from "@/lib/motion";

// 3D Tilt Card Component
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: "transform 0.1s ease-out",
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)",
            transition: "transform 0.5s ease-out",
        });
    };

    return (
        <div
            ref={ref}
            className={`transform-style-3d ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={style}
        >
            {children}
        </div>
    );
}

// Main Page
export default function Home() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <LazyMotion features={domAnimation}>
            <main className="min-h-screen bg-brand-cream overflow-hidden selection:bg-brand-green selection:text-white">

                {/* Hero Section with 3D */}
                <section className="relative h-screen flex items-center overflow-hidden">
                    <Scene3D />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Text Content */}
                            <m.div
                                initial="initial"
                                animate="animate"
                                variants={fadeUp}
                                className="max-w-xl"
                            >
                                <div className="inline-block px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/40 mb-6 shadow-sm">
                                    <span className="text-sm font-semibold text-brand-blue tracking-wider uppercase">
                                        ✨ Purest Farm Fresh Milk
                                    </span>
                                </div>

                                <h1 className="text-6xl md:text-7xl font-bold text-brand-blue mb-6 leading-tight drop-shadow-sm">
                                    Freshness <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-teal-400">
                                        Reimagined.
                                    </span>
                                </h1>

                                <p className="text-xl text-brand-blue/80 mb-10 leading-relaxed max-w-lg">
                                    Experience dairy like never before. Pure, traceable, and delivered with a touch of magic straight to your doorstep.
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <MagneticButton>
                                        <NavigateButton
                                            href="/products"
                                            className="bg-brand-blue text-white hover:bg-brand-blue/90 border-none shadow-xl shadow-brand-blue/20 text-lg px-8 py-4 rounded-full flex items-center gap-2 group"
                                        >
                                            Order Now
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </NavigateButton>
                                    </MagneticButton>

                                    <MagneticButton>
                                        <NavigateButton
                                            href="/login"
                                            className="bg-white/50 backdrop-blur-md text-brand-blue border border-white hover:bg-white text-lg px-8 py-4 rounded-full shadow-lg"
                                        >
                                            Login
                                        </NavigateButton>
                                    </MagneticButton>
                                </div>
                            </m.div>
                        </div>
                    </div>

                    {/* Animated Scroll Indicator */}
                    <m.div
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <div className="w-6 h-10 border-2 border-brand-blue/30 rounded-full flex justify-center p-1">
                            <m.div
                                className="w-1 h-2 bg-brand-blue/50 rounded-full"
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                        </div>
                    </m.div>
                </section>

                {/* Features Section */}
                <section className="py-32 relative">
                    <Container>
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, ease: smoothEase }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-4xl font-bold text-brand-blue mb-4">Why Choose Doodhly?</h2>
                            <p className="text-xl text-brand-blue/60 max-w-2xl mx-auto">
                                We combine traditional purity with modern technology to ensure the best for your family.
                            </p>
                        </m.div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Daily Fresh", desc: "Milk delivered within 4 hours of milking", icon: "🥛" },
                                { title: "Smart Tracking", desc: "Real-time delivery tracking with 3D maps", icon: "📍" },
                                { title: "Flexible Plans", desc: "Pause, skip, or modify anytime", icon: "⚡" },
                            ].map((feature) => (
                                <TiltCard key={feature.title} className="h-64">
                                    <div className="h-full glass rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:shadow-floating transition-shadow duration-300">
                                        <span className="text-5xl mb-4 animate-float">{feature.icon}</span>
                                        <h3 className="text-xl font-bold text-brand-blue mb-2">{feature.title}</h3>
                                        <p className="text-brand-blue/60">{feature.desc}</p>
                                    </div>
                                </TiltCard>
                            ))}
                        </div>

                    </Container>
                </section>
            </main >
        </LazyMotion>
    );
}