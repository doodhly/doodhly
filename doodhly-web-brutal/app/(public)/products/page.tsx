"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface Product {
    id: number;
    name: string;
    price_paisa: number;
    description?: string;
    is_active: boolean;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Product[]>('/admin/products')
            .then(res => setProducts(res.filter(p => p.is_active)))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-4xl bg-brutal-bg uppercase">LOADING...</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
            <header className="mb-16 border-b-4 border-black pb-12">
                <h1 className="font-sans font-black text-7xl md:text-9xl mb-4 uppercase">The Goods.</h1>
                <div className="font-mono text-xl md:text-2xl font-bold bg-black text-white inline-block px-4 py-2 transform -rotate-1 shadow-[4px_4px_0px_#brutal-primary]">
                    Potions for your daily grind.
                </div>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {products.map((product, idx) => {
                    const isCow = product.name.toLowerCase().includes('cow');
                    // distinct visual style for cow vs buffalo
                    const cardColor = isCow ? 'bg-[length:24px_24px] bg-[radial-gradient(#4ECDC4_25%,transparent_25%),#fff]' : 'bg-[length:24px_24px] bg-[radial-gradient(#FF6B6B_25%,transparent_25%),#fff]';
                    const titleBg = isCow ? 'bg-brutal-blue' : 'bg-brutal-pink';

                    return (
                        <BrutalCard key={product.id} className="flex flex-col bg-white border-4 p-0 overflow-hidden shadow-[8px_8px_0px_#000] hover:-translate-y-2 transition-transform duration-200">
                            {/* Header / Image Area */}
                            <div className={`h-64 border-b-4 border-black ${cardColor} relative flex items-center justify-center`}>
                                <div className={`absolute top-4 right-4 ${titleBg} border-2 border-black px-3 py-1 font-mono font-bold text-xs shadow-[2px_2px_0px_#000]`}>
                                    FRESH
                                </div>
                                <h2 className="font-sans font-black text-5xl uppercase text-center bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000] rotate-2">
                                    {product.name.split(' ')[0]}
                                </h2>
                            </div>

                            <div className="flex-1 p-8">
                                <h3 className="font-sans font-black text-4xl mb-4 leading-none">{product.name}</h3>
                                <p className="font-mono font-bold text-sm text-gray-500 mb-8 leading-relaxed">
                                    {product.description || "Fresh, raw, and strictly tested. Delivered chilled to your door by 7 AM."}
                                </p>

                                <div className="flex items-baseline mb-8">
                                    <span className="font-sans font-black text-6xl">₹{product.price_paisa / 100}</span>
                                    <span className="font-mono font-bold text-sm text-gray-400 ml-2 uppercase tracking-widest">/ Liter</span>
                                </div>
                            </div>

                            <div className="p-8 pt-0 mt-auto">
                                <Link href="/login">
                                    <BrutalButton className="w-full text-xl h-20 border-4 shadow-[4px_4px_0px_#000]">
                                        SUBSCRIBE
                                    </BrutalButton>
                                </Link>
                            </div>
                        </BrutalCard>
                    );
                })}
            </div>
        </div>
    );
}
