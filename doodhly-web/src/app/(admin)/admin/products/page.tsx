"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical, Edit2, Archive, CheckCircle2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
    id: number;
    name: string;
    description: string;
    price_paisa: number;
    unit: string;
    is_active: boolean;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price_paisa: 0,
        unit: "Ltr",
        is_active: true
    });

    const fetchProducts = async () => {
        try {
            const data = await api.get<Product[]>("/admin/products");
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post("/admin/products", formData);
            await fetchProducts();
            setIsAddModalOpen(false);
            setFormData({ name: "", description: "", price_paisa: 0, unit: "Ltr", is_active: true });
        } catch (err) {
            alert("Failed to create product");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleProductStatus = async (id: number, current: boolean) => {
        try {
            await api.patch(`/admin/products/${id}/toggle`, { is_active: !current });
            setProducts(products.map(p => p.id === id ? { ...p, is_active: !current } : p));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Loading Product Catalog...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
                    <p className="text-sm text-slate-500">Manage your milk variants and pricing</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-brand-blue text-white rounded-2xl px-6 flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add Variant</span>
                </Button>
            </header>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className={cn(
                        "bg-white rounded-[2rem] border p-6 transition-all group relative overflow-hidden",
                        !product.is_active && "bg-slate-50 opacity-75"
                    )}>
                        {!product.is_active && (
                            <div className="absolute top-0 right-0 p-3">
                                <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-2 py-1 rounded-full uppercase">Archived</span>
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                <Package size={24} />
                            </div>
                            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-slate-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{product.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Price / {product.unit}</p>
                                <p className="text-xl font-black text-brand-blue">₹{product.price_paisa / 100}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleProductStatus(product.id, product.is_active)}
                                className={cn(
                                    "rounded-xl text-xs font-bold",
                                    product.is_active ? "text-slate-600 border-slate-200" : "text-green-600 border-green-200 bg-green-50"
                                )}
                            >
                                {product.is_active ? "Archive" : "Re-activate"}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Product Modal (Simple Mock) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Variant</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="rotate-45" size={24} /></button>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Product Name</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 border-transparent rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-blue transition-all"
                                    placeholder="e.g. A2 Desi Cow Milk"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Price (Rupees)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-slate-50 border-transparent rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-blue"
                                        placeholder="60"
                                        onChange={e => setFormData({ ...formData, price_paisa: Number(e.target.value) * 100 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Unit</label>
                                    <select
                                        className="w-full bg-slate-50 border-transparent rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-blue h-[54px]"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="Ltr">Litre (Ltr)</option>
                                        <option value="Packet">Packet</option>
                                        <option value="Kg">Kilogram (Kg)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea
                                    className="w-full bg-slate-50 border-transparent rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-blue min-h-[100px]"
                                    placeholder="Milk properties and benefits..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <Button type="submit" disabled={isSaving} className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-blue/20">
                                {isSaving ? "Saving..." : "Create Product"}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
