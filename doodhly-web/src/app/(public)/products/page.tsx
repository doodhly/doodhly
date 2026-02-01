"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Droplets, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductsPage() {
    const products = [
        {
            id: 1,
            name: "Pure Cow Milk",
            description: "Fresh, unadulterated cow milk delivered daily by 10 AM.",
            price: "₹60",
            unit: "per liter",
            features: ["Antibiotic Free", "No Preservatives", "Glass Bottle (Optional)"],
            popular: true,
            color: "bg-blue-50 text-brand-blue"
        },
        {
            id: 2,
            name: "Buffalo Milk",
            description: "Rich and creamy, perfect for making curd, ghee and tea.",
            price: "₹80",
            unit: "per liter",
            features: ["High Fat Content", "Thick & Creamy", "Farm Fresh"],
            popular: false,
            color: "bg-orange-50 text-orange-700"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-brand-cream/30 pb-20">
            {/* Header */}
            <div className="bg-brand-blue text-white py-20 px-4 text-center rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-2xl mx-auto space-y-4"
                >
                    <h1 className="font-serif text-4xl md:text-5xl font-bold">Our Fresh Products</h1>
                    <p className="text-blue-100 text-lg">Straight from our farm to your family's table.</p>
                </motion.div>
            </div>

            {/* Product Grid */}
            <div className="container px-4 py-16 -mt-10 relative z-20">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {products.map((product, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <GlassCard className="h-full flex flex-col hover:scale-[1.02] transition-transform duration-300">
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl ${product.color}`}>
                                            <Droplets className="w-8 h-8" />
                                        </div>
                                        {product.popular && (
                                            <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                Bestseller
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                                    <p className="text-gray-500 mb-6 leading-relaxed">{product.description}</p>

                                    <ul className="space-y-3 mb-8">
                                        {product.features.map((feat, i) => (
                                            <li key={i} className="flex items-center text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 mr-3" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-8 pt-0 mt-auto border-t border-gray-100/50">
                                    <div className="flex items-end gap-1 mb-6">
                                        <span className="text-3xl font-bold text-brand-blue">{product.price}</span>
                                        <span className="text-gray-400 font-medium mb-1">/{product.unit}</span>
                                    </div>

                                    <Link href="/app/subscriptions/new" className="block">
                                        <Button className="w-full text-lg h-12 rounded-xl group">
                                            Subscribe Now
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
