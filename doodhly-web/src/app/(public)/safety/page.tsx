"use client";

import { Container } from "@/components/ui/Container";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SafetyPage() {
    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-brand-cream/30 py-24">
                <Container className="space-y-16">
                    <m.div
                        initial="initial"
                        animate="animate"
                        variants={fadeUp}
                        className="max-w-3xl mx-auto text-center space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 backdrop-blur-md rounded-full text-green-700 text-sm font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" /> Quality Assured
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-blue">
                            Uncompromising Safety.
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed text-center">
                            When it comes to your family's health, we take zero risks. Every drop of Doodhly milk is subject to rigorous testing.
                        </p>
                    </m.div>

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {[
                            { title: "27-Point Testing", desc: "Tested for adulterants, antibiotics, and water before packaging." },
                            { title: "Cold Chain at 4°C", desc: "Maintained chilled from milking to delivery, preserving all nutrients." },
                            { title: "Zero Touch", desc: "Automated bottling and processing ensures maximum hygiene levels." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-xl shadow-brand-blue/5 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mb-6" />
                                <h3 className="text-xl font-bold text-brand-blue mb-4">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </m.div>
                </Container>
            </div>
        </LazyMotion>
    );
}
