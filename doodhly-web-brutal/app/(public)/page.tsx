import { BrutalButton } from "@/components/brutal/BrutalButton";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Smile, Star } from "lucide-react";

export default function Home() {
    return (
        <div className="space-y-0 pb-20">
            {/* Hero Section */}
            <section className="border-b-4 border-black bg-brutal-yellow py-20 md:py-32 relative overflow-hidden">
                {/* Floating Sticker */}
                <div className="absolute top-10 right-10 md:right-20 rotate-12 bg-white border-4 border-black p-6 shadow-brutal hidden md:block animate-bounce z-10 transform scale-125">
                    <Star className="inline mr-2 h-6 w-6 text-black fill-current" />
                    <span className="font-black uppercase tracking-widest text-lg">Fresh AF 🥛</span>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-0">
                    <h1 className="font-sans font-black text-6xl md:text-[10rem] mb-8 leading-[0.85] tracking-tighter">
                        MILK.<br />
                        <span className="text-white text-stroke-3 drop-shadow-hard">RAW.</span><br />
                        <span className="text-brutal-pink">REAL.</span>
                    </h1>

                    <div className="max-w-xl bg-white border-4 border-black p-6 shadow-brutal transform -rotate-2 mb-12">
                        <p className="font-mono text-xl md:text-2xl font-bold leading-tight uppercase">
                            Cow to glass in 4 hours. No filters. No preservatives. No marketing fluff.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <Link href="/products">
                            <BrutalButton size="lg" className="w-full md:w-auto text-2xl h-20 px-12 border-4 shadow-brutal-lg">
                                GET MILK <ArrowRight className="ml-4 h-8 w-8" strokeWidth={3} />
                            </BrutalButton>
                        </Link>
                        <Link href="/about">
                            <BrutalButton variant="outline" size="lg" className="w-full md:w-auto text-xl h-20 px-12 border-4">
                                HOW WE DO IT
                            </BrutalButton>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Marquee Divider (Visual Only using text) */}
            <div className="bg-black text-white overflow-hidden py-4 border-b-4 border-black">
                <div className="font-mono font-bold text-2xl uppercase tracking-widest whitespace-nowrap animate-marquee">
                    • RAW MILK • PRESERVATIVE FREE • LAB TESTED • DAILY DELIVERY • BADASS COWS • NO BS •
                    RAW MILK • PRESERVATIVE FREE • LAB TESTED • DAILY DELIVERY • BADASS COWS • NO BS •
                </div>
            </div>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-4 py-32">
                <div className="grid md:grid-cols-3 gap-12">
                    <BrutalCard color="bg-brutal-blue" className="rotate-2 hover:rotate-0 transition-transform h-full min-h-[400px] flex flex-col justify-between border-4">
                        <Zap className="h-20 w-20 mb-6 text-black" strokeWidth={2} />
                        <div>
                            <h3 className="font-sans text-5xl mb-4 leading-none">FAST<br />DELIVERY.</h3>
                            <p className="font-mono text-lg font-bold">We milk at 4 AM. You drink at 7 AM. Speedrun delivery directly to your doorstep.</p>
                        </div>
                    </BrutalCard>

                    <BrutalCard color="bg-white" className="-rotate-2 hover:rotate-0 transition-transform h-full min-h-[400px] flex flex-col justify-between border-4 relative top-12 md:top-0">
                        <Shield className="h-20 w-20 mb-6 text-black" strokeWidth={2} />
                        <div>
                            <h3 className="font-sans text-5xl mb-4 leading-none">TESTED<br />DAILY.</h3>
                            <p className="font-mono text-lg font-bold">21+ Lab tests. Sealed glass bottles. Zero touch points. Safer than your tap water.</p>
                        </div>
                    </BrutalCard>

                    <BrutalCard color="bg-brutal-pink" className="rotate-1 hover:rotate-0 transition-transform h-full min-h-[400px] flex flex-col justify-between border-4">
                        <Smile className="h-20 w-20 mb-6 text-black" strokeWidth={2} />
                        <div>
                            <h3 className="font-sans text-5xl mb-4 leading-none">HAPPY<br />COWS only.</h3>
                            <p className="font-mono text-lg font-bold">Our cows listen to jazz, eat organic grass, and have better healthcare than you.</p>
                        </div>
                    </BrutalCard>
                </div>
            </section>

            {/* Big CTA */}
            <section className="border-y-4 border-black bg-brutal-green py-32 text-center relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 relative z-10">
                    <h2 className="font-sans font-black text-6xl md:text-8xl mb-12 leading-none uppercase">
                        Stop drinking<br />
                        <span className="text-white text-stroke-3">watered-down</span> milk.
                    </h2>
                    <BrutalButton variant="primary" size="lg" className="w-full md:w-auto font-sans text-3xl py-8 h-24 px-16 border-4 shadow-[8px_8px_0px_#000]">
                        START SUBSCRIPTION
                    </BrutalButton>
                </div>
            </section>
        </div>
    );
}
