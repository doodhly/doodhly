"use client";

import { Container } from "@/components/ui/Container";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { NavigateButton } from "@/components/buttons/NavigateButton";
import { ArrowRight, Info } from "lucide-react";

export default function AboutPage() {
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 backdrop-blur-md rounded-full text-brand-blue text-sm font-bold uppercase tracking-wider">
                            <Info className="w-4 h-4" /> About Doodhly
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-blue">
                            Our Mission is Pure.
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed text-center">
                            Doodhly was born from a simple idea: everyone deserves access to fresh, unadulterated milk.
                            In a world of processing and preservatives, we stand for the traditional way of dairy.
                            Milk as it should be—straight from the farm to your doorstep within hours.
                        </p>
                    </m.div>

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 gap-12 items-center bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/40 shadow-xl shadow-brand-blue/5"
                    >
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-brand-blue">The Doodhly Difference</h2>
                            <ul className="space-y-4 text-gray-600 list-disc list-inside">
                                <li><strong>Local Farms:</strong> We partner exclusively with ethical, local dairy farmers.</li>
                                <li><strong>Cold Chain:</strong> Temperature-controlled logistics ensure perfect quality.</li>
                                <li><strong>No Middlemen:</strong> Direct from the source to you.</li>
                            </ul>
                            <NavigateButton
                                href="/products"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-full font-medium shadow-md shadow-brand-blue/20 hover:scale-105 transition-all"
                            >
                                Try it Today <ArrowRight className="w-4 h-4" />
                            </NavigateButton>
                        </div>
                        <div className="bg-brand-blue/5 flex items-center justify-center p-12 rounded-2xl border border-brand-blue/10 h-64">
                            <span className="text-8xl animate-bounce">🐄</span>
                        </div>
                    </m.div>
                </Container>
            </div>
        </LazyMotion>
    );
}
