"use client";

import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import Link from "next/link";
import { ArrowRight, Info, Target, Heart } from "lucide-react";

export default function PublicAbout() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-40">
            <div className="mb-16 border-b-8 border-black pb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white font-mono font-bold uppercase tracking-widest text-sm mb-6 shadow-[2px_2px_0px_#brutal-primary]">
                    <Info className="w-4 h-4" /> ABOUT US
                </div>
                <h1 className="font-sans font-black text-7xl md:text-9xl tracking-tighter uppercase leading-[0.85] mb-6">
                    RAW. <br />
                    UNFILTERED. <br />
                    <span className="text-brutal-primary bg-black px-4 ml-[-10px] inline-block leading-tight">MILK.</span>
                </h1>
                <p className="font-mono font-bold text-2xl max-w-2xl uppercase border-l-8 border-brutal-primary pl-6">
                    WE DON'T DO COMPROMISES. WE DO MILKING, TESTING, AND DELIVERING. FAST.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                <BrutalCard className="border-8 bg-brutal-yellow shadow-[16px_16px_0px_#000] p-8 md:p-12 hover:-translate-y-2 transition-transform">
                    <Target className="w-16 h-16 mb-8" strokeWidth={3} />
                    <h2 className="font-black text-5xl uppercase mb-6">THE MISSION.</h2>
                    <p className="font-mono font-bold text-lg uppercase leading-relaxed text-justify">
                        Big dairy corporations lied to you. They process the life out of your milk so it survives on shelves for months. That isn't milk. That's a milky liquid.
                        We started Doodhly to bring back the real stuff. From our local network of vetted farmers directly to your door before the sun even finishes rising.
                    </p>
                </BrutalCard>

                <div className="space-y-8">
                    <div className="bg-black text-white p-8 border-4 border-brutal-primary shadow-[8px_8px_0px_#brutal-blue] transform rotate-1">
                        <Heart className="w-12 h-12 mb-4 text-brutal-pink" strokeWidth={3} />
                        <h3 className="font-black text-3xl uppercase mb-2">FARMER FIRST.</h3>
                        <p className="font-mono text-sm uppercase">We pay our farmers 40% above market rate. Straight cash. No middleman cuts.</p>
                    </div>

                    <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_#brutal-pink] transform -rotate-1">
                        <h3 className="font-black text-3xl uppercase mb-2">ZERO BS POLICY.</h3>
                        <p className="font-mono text-sm uppercase font-bold">No preservatives. No artificial homogenisation. Just milk and a cold truck.</p>
                    </div>
                </div>
            </div>

            <div className="text-center py-20 border-t-8 border-dashed border-black">
                <h2 className="font-black text-5xl md:text-7xl uppercase mb-8">THIRSTY YET?</h2>
                <Link href="/products">
                    <BrutalButton className="text-2xl h-24 px-12 bg-brutal-primary border-8 shadow-[12px_12px_0px_#000] hover:-translate-y-2 transition-transform mx-auto inline-flex items-center">
                        SEE OUR PRODUCTS <ArrowRight className="w-8 h-8 ml-4 stroke-[3px]" />
                    </BrutalButton>
                </Link>
            </div>
        </div>
    );
}
