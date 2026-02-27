"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Droplets, Star, Loader2, AlertCircle } from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { api } from "@/lib/api";
import { Container } from "@/components/ui/Container";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface Product {
    id: number;
    name: string;
    description?: string;
    price_paisa: number;
    is_active: boolean;
    category?: string;
}

export default function ProductsPage() {
    const [fetchState, setFetchState] = useState<{ products: Product[]; loading: boolean; error: string | null }>({
        products: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await api.get<Product[]>('/admin/products');
                const activeProducts = data.filter(p => p.is_active);
                setFetchState({ products: activeProducts, loading: false, error: null });
            } catch (err: any) {
                console.error('Products fetch error:', err);
                setFetchState(prev => ({ ...prev, loading: false, error: err.message || 'Failed to load products' }));
            }
        };
        fetchProducts();
    }, []);

    const getProductColor = (name: string) => {
        if (name.toLowerCase().includes('cow')) return "bg-blue-50 text-brand-blue";
        if (name.toLowerCase().includes('buffalo')) return "bg-orange-50 text-orange-700";
        return "bg-green-50 text-green-700";
    };

    const getProductDescription = (product: Product) => {
        return product.description || "Fresh, farm-sourced milk delivered to your doorstep daily.";
    };

    const getProductFeatures = (name: string) => {
        const defaultFeatures = ["100% Pure", "Farm Fresh", "Daily Delivery"];
        if (name.toLowerCase().includes('cow')) {
            return ["Antibiotic Free", "No Preservatives", "Glass Bottle (Optional)"];
        }
        if (name.toLowerCase().includes('buffalo')) {
            return ["High Fat Content", "Thick & Creamy", "Farm Fresh"];
        }
        return defaultFeatures;
    };

    if (fetchState.loading) {
        return (
            <div className="flex flex-col min-h-screen bg-brand-cream/30 pb-20">
                <div className="bg-brand-blue text-white py-20 px-4 text-center rounded-b-[3rem] shadow-xl">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold">Our Fresh Products</h1>
                    <p className="text-blue-100 text-lg mt-4">Straight from our farm to your family's table.</p>
                </div>
                <div className="container px-4 py-16 -mt-10">
                    <div className="flex items-center justify-center min-h-[40vh]">
                        <Loader2 className="h-12 w-12 animate-spin text-brand-blue" />
                    </div>
                </div>
            </div>
        );
    }

    if (fetchState.error) {
        return (
            <div className="flex flex-col min-h-screen bg-brand-cream/30 pb-20">
                <div className="bg-brand-blue text-white py-20 px-4 text-center rounded-b-[3rem] shadow-xl">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold">Our Fresh Products</h1>
                </div>
                <div className="container px-4 py-16 -mt-10">
                    <div className="max-w-md mx-auto bg-white border border-red-200 rounded-2xl p-8 text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Products</h3>
                        <p className="text-gray-500 mb-6">{fetchState.error}</p>
                        <Button onClick={() => window.location.reload()} className="bg-brand-blue text-white">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (fetchState.products.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-brand-cream/30 pb-20">
                <div className="bg-brand-blue text-white py-20 px-4 text-center rounded-b-[3rem] shadow-xl">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold">Our Fresh Products</h1>
                </div>
                <div className="container px-4 py-16 -mt-10">
                    <div className="max-w-md mx-auto bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                        <Droplets className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Available</h3>
                        <p className="text-gray-500">We're restocking our products. Check back soon!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <LazyMotion features={domAnimation}>
        <div className="flex flex-col min-h-screen bg-brand-cream/30 pb-20">
            <div className="bg-brand-blue text-white py-20 px-4 text-center rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <Container className="relative z-10 space-y-4">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold">Our Fresh Products</h1>
                    <p className="text-blue-100 text-lg">Straight from our farm to your family's table.</p>
                </Container>
            </div>

            <Container className="px-4 py-16 -mt-10 relative z-20">
                <m.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {fetchState.products.map((product, idx) => (
                        <m.div
                            key={product.id}
                            variants={fadeUp}
                        >
                            <GlassCard className="h-full flex flex-col hover:scale-[1.02] transition-transform duration-300">
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl ${getProductColor(product.name)}`}>
                                            <Droplets className="w-8 h-8" />
                                        </div>
                                        {idx === 0 && (
                                            <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                Bestseller
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                                    <p className="text-gray-500 mb-6 leading-relaxed">{getProductDescription(product)}</p>

                                    <ul className="space-y-3 mb-8">
                                        {getProductFeatures(product.name).map((feat) => (
                                            <li key={feat} className="flex items-center text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 mr-3" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-8 pt-0 mt-auto border-t border-gray-100/50">
                                    <div className="flex items-end gap-1 mb-6">
                                        <span className="text-3xl font-bold text-brand-blue">₹{product.price_paisa / 100}</span>
                                        <span className="text-gray-400 font-medium mb-1">/per liter</span>
                                    </div>

                                    <Link href="/app/subscriptions/new" className="block">
                                        <Button className="w-full text-lg h-12 rounded-xl group">
                                            Subscribe Now
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </GlassCard>
                        </m.div>
                    ))}
                </m.div>
            </Container>
        </div>
        </LazyMotion>
    );
}
