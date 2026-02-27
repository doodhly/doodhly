"use client";

import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { ArrowLeft, User, MapPin, Truck, CheckSquare, XSquare, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function DeliveryDetailsPage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-8 pb-24 max-w-2xl mx-auto">
            <div className="border-b-4 border-black pb-4">
                <Link href="/partner/route" className="inline-flex items-center font-mono font-bold uppercase hover:bg-black hover:text-white px-2 mb-4 border-2 border-transparent hover:border-black transition-all">
                    <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO ROUTE
                </Link>
                <h1 className="font-sans font-black text-5xl uppercase mb-1">STOP #{params.id || "12"}</h1>
                <p className="font-mono font-bold text-gray-500 uppercase">DELIVERY DETAILS</p>
            </div>

            <BrutalCard className="border-4 bg-white p-6 shadow-[8px_8px_0px_#000]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="font-black text-3xl uppercase flex items-center gap-2"><User className="w-6 h-6" /> RAHUL SHARMA</h2>
                        <p className="font-mono font-bold text-gray-500 uppercase mt-1">+91 98765 43210</p>
                    </div>
                    <a href="tel:9876543210" className="bg-brutal-blue border-4 border-black p-3 hover:bg-brutal-yellow transition-colors shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none">
                        <PhoneCall className="w-6 h-6" />
                    </a>
                </div>

                <div className="bg-gray-100 border-4 border-dashed border-gray-400 p-4 mb-6 flex items-start gap-4">
                    <MapPin className="w-6 h-6 shrink-0 mt-1" />
                    <div>
                        <p className="font-mono font-bold uppercase">14A, GREENWOOD GARDENS, BLOCK C, GACHIBOWLI</p>
                        <a href="#" className="text-xs font-black underline uppercase hover:text-brutal-primary mt-2 inline-block">OPEN IN MAPS</a>
                    </div>
                </div>

                <div className="border-t-4 border-black pt-6">
                    <h3 className="font-bold font-mono uppercase tracking-widest text-sm mb-4">ORDER REQUIREMENTS</h3>
                    <div className="flex items-center justify-between border-4 border-black p-4 bg-brutal-yellow/20">
                        <div className="flex items-center gap-4">
                            <Truck className="w-8 h-8" />
                            <span className="font-black text-2xl uppercase">2x COW MILK (1L)</span>
                        </div>
                        <span className="font-mono font-black border-2 border-black bg-white px-2 py-1">BAG F</span>
                    </div>
                </div>
            </BrutalCard>

            <div className="grid grid-cols-2 gap-4">
                <BrutalButton className="h-20 text-xl border-4 bg-success shadow-[6px_6px_0px_#000]">
                    <CheckSquare className="w-8 h-8 mr-2" /> DELIVERED
                </BrutalButton>
                <BrutalButton className="h-20 text-xl border-4 bg-error text-white shadow-[6px_6px_0px_#000]">
                    <XSquare className="w-8 h-8 mr-2" /> FAILED
                </BrutalButton>
            </div>
        </div>
    );
}
