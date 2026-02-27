"use client";

import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { Milk, Plus, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<any[]>('/customer/products')
            .then(res => setProducts(res || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8 pb-20">
            <div className="border-b-4 border-black pb-6 flex justify-between items-end">
                <div>
                    <h1 className="font-sans font-black text-5xl md:text-7xl uppercase mb-2 flex items-center gap-4">
                        <Milk className="w-12 h-12 hidden md:block" strokeWidth={3} /> PRODUCTS.
                    </h1>
                    <p className="font-mono font-bold text-gray-500 uppercase">Catalog Management</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <BrutalButton><Plus className="w-5 h-5 mr-2" /> ADD PRODUCT</BrutalButton>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center font-black text-2xl uppercase border-4 border-black bg-white shadow-[8px_8px_0px_#000]">LOADING CATALOG...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product, i) => (
                        <BrutalCard key={product.id || i} className="border-4 bg-white shadow-[6px_6px_0px_#000] flex flex-col justify-between group">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-mono font-black text-xl bg-brutal-yellow border-2 border-black px-2 py-1 uppercase shadow-[2px_2px_0px_#000]">
                                        ₹{product.price}
                                    </span>
                                    {product.in_stock ? (
                                        <span className="text-xs font-bold bg-success border-2 border-black px-2 py-1 uppercase">IN STOCK</span>
                                    ) : (
                                        <span className="text-xs font-bold bg-error text-white border-2 border-black px-2 py-1 uppercase">OUT OF STOCK</span>
                                    )}
                                </div>
                                <h3 className="font-black text-3xl uppercase mb-2 group-hover:underline decoration-4 underline-offset-4">{product.name}</h3>
                                <p className="font-mono font-bold text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>

                                <div className="font-mono font-bold text-xs uppercase border-t-2 border-dashed border-black pt-2 mb-6">
                                    CATEGORY: {product.category}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <BrutalButton variant="outline" className="flex-1 text-xs h-10 hover:bg-black hover:text-white"><Edit2 className="w-4 h-4 mr-1" /> EDIT</BrutalButton>
                                <button className="border-4 border-black bg-error text-white p-2 hover:bg-red-700 active:translate-y-1 shadow-[2px_2px_0px_#000] active:shadow-none transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </BrutalCard>
                    ))}

                    <BrutalCard className="border-4 border-dashed border-gray-400 bg-transparent shadow-none hover:bg-gray-100 transition-colors flex flex-col items-center justify-center min-h-[250px] cursor-pointer text-gray-400 hover:text-black">
                        <Plus className="w-16 h-16 mb-4" />
                        <span className="font-black text-xl uppercase">ADD NEW PRODUCT</span>
                    </BrutalCard>
                </div>
            )}
        </div>
    );
}
