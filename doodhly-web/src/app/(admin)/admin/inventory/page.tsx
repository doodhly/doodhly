
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";

interface Forecast {
    id: number;
    date: string;
    product_name: string;
    sector: string;
    predicted_qty: number;
    actual_qty: number | null;
    updated_at: string;
}

export default function InventoryPage() {
    const [forecasts, setForecasts] = useState<Forecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [date, setDate] = useState(new Date());

    const fetchForecasts = async () => {
        try {
            setLoading(true);
            const dateStr = format(date, "yyyy-MM-dd");
            const res: any = await api.get(`/admin/inventory/forecast?date=${dateStr}`);
            setForecasts(res.data.forecasts || []);
        } catch (error) {
            console.error("Failed to fetch forecasts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const dateStr = format(date, "yyyy-MM-dd");
            await api.post("/admin/inventory/forecast/generate", { date: dateStr });
            await fetchForecasts();
            alert("Forecast regenerated successfully");
        } catch (error) {
            console.error("Failed to generate", error);
            alert("Failed to generate forecast");
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        fetchForecasts();
    }, [date]);

    // Calculate total predicted
    const totalPredicted = forecasts.reduce((sum, f) => sum + f.predicted_qty, 0);

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen text-slate-900">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Inventory Forecast</h1>
                    <p className="text-slate-500 font-medium">Predictive demand planning for {format(date, "MMMM do, yyyy")}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            const d = new Date(date);
                            d.setDate(d.getDate() - 1);
                            setDate(d);
                        }}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50"
                    >
                        Prev Day
                    </button>
                    <button
                        onClick={() => {
                            const d = new Date(date);
                            d.setDate(d.getDate() + 1);
                            setDate(d);
                        }}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50"
                    >
                        Next Day
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-4 py-2 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-600 flex items-center gap-2"
                    >
                        {generating ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                        {generating ? "Computing..." : "Regenerate Forecast"}
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Total Demand</h3>
                    <p className="text-4xl font-black mt-2 text-brand-blue">{totalPredicted} <span className="text-lg text-slate-400">Units</span></p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Sectors</h3>
                    <p className="text-4xl font-black mt-2 text-purple-600">{new Set(forecasts.map(f => f.sector)).size}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Safety Buffer</h3>
                    <p className="text-4xl font-black mt-2 text-green-600">+10%</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">Product</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">Sector</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Predicted Qty</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actual Qty</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400">
                                    <Loader2 className="animate-spin mx-auto mb-2" />
                                    Loading data...
                                </td>
                            </tr>
                        ) : forecasts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400">
                                    <AlertTriangle className="mx-auto mb-2 opacity-50" />
                                    No forecasts found for this date.
                                </td>
                            </tr>
                        ) : (
                            forecasts.map((f) => (
                                <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700">{f.product_name}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-500">{f.sector}</span>
                                    </td>
                                    <td className="p-4 text-right font-black text-brand-blue text-lg">{f.predicted_qty}</td>
                                    <td className="p-4 text-right font-bold text-slate-400">{f.actual_qty ?? '-'}</td>
                                    <td className="p-4 text-right text-xs text-slate-400 font-mono">
                                        {format(new Date(f.updated_at), "HH:mm")}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
