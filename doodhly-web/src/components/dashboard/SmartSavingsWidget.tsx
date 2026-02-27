
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TrendingUp, AlertTriangle, IndianRupee } from "lucide-react";

interface AnalyticsStats {
    monthYear: string;
    predicted_liters: number;
    churn_probability: number;
    savings: number;
}

export default function SmartSavingsWidget() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get<AnalyticsStats>('/analytics/dashboard');
                setStats(data);
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="h-32 bg-slate-900/50 animate-pulse rounded-2xl" />;

    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Savings Card */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <IndianRupee size={64} className="text-green-500" />
                </div>
                <h3 className="text-green-500 text-xs font-bold uppercase tracking-wider mb-1">Pass Savings</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">₹{stats.savings}</span>
                    <span className="text-[10px] text-slate-400">saved this month</span>
                </div>
            </div>

            {/* Consumption / Churn Card */}
            <div className={`border rounded-2xl p-4 relative overflow-hidden ${stats.churn_probability > 0.6
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-slate-900/50 border-white/5'
                }`}>
                {stats.churn_probability > 0.6 ? (
                    <>
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <AlertTriangle size={64} className="text-red-500" />
                        </div>
                        <h3 className="text-red-500 text-xs font-bold uppercase tracking-wider mb-1">Stock Alert</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Running low? Your pattern suggests you might need a top-up soon.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <TrendingUp size={64} className="text-brand-blue" />
                        </div>
                        <h3 className="text-brand-blue text-xs font-bold uppercase tracking-wider mb-1">Predicted Usage</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white">{stats.predicted_liters}L</span>
                            <span className="text-[10px] text-slate-400">next 30 days</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
