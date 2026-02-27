"use client";

import { useState } from "react";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { Plus, Download, CalendarClock } from "lucide-react";
import { api } from "@/lib/api";

const MOCK_RUNS = [
    { id: "RS-101", date: "TODAY", partner: "Rahul K.", stops: 45, status: "IN PROGRESS" },
    { id: "RS-102", date: "TODAY", partner: "Suresh P.", stops: 32, status: "PENDING" },
    { id: "RS-099", date: "YESTERDAY", partner: "Amit S.", stops: 41, status: "COMPLETED" },
];

export default function AdminRunSheets() {
    const [generating, setGenerating] = useState(false);

    const handleGenerateRuns = async () => {
        setGenerating(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            // Admin must manually pass city_id for now, default to 1 (Sakti) for Sprint 2
            await api.post('/admin/jobs/nightly-batch', { date: today, city_id: 1 });
            alert("Run sheets generated successfully for today!");
            // Ideally, we fetch the real list of runs here instead of mock
        } catch (err: any) {
            console.error(err);
            alert(`Failed to generate sheets: ${err.message}`);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="border-b-4 border-black pb-6 flex justify-between items-end">
                <div>
                    <h1 className="font-sans font-black text-5xl md:text-7xl uppercase mb-2 flex items-center gap-4">
                        <CalendarClock className="w-12 h-12 hidden md:block" strokeWidth={3} /> RUN SHEETS.
                    </h1>
                    <p className="font-mono font-bold text-gray-500 uppercase">Manage Hub Deliveries</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <BrutalButton variant="outline"><Download className="w-5 h-5 mr-2" /> EXPORT</BrutalButton>
                    <BrutalButton onClick={handleGenerateRuns} disabled={generating}>
                        {generating ? <CalendarClock className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                        {generating ? "GENERATING..." : "GENERATE TODAY'S RUNS"}
                    </BrutalButton>
                </div>
            </div>

            <BrutalCard className="border-4 bg-white p-0 overflow-hidden shadow-[8px_8px_0px_#000]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono font-bold uppercase whitespace-nowrap">
                        <thead className="bg-brutal-blue border-b-4 border-black">
                            <tr>
                                <th className="p-4 border-r-2 border-black">Run ID</th>
                                <th className="p-4 border-r-2 border-black">Date</th>
                                <th className="p-4 border-r-2 border-black">Partner</th>
                                <th className="p-4 border-r-2 border-black text-right">Stops</th>
                                <th className="p-4 border-r-2 border-black">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_RUNS.map((run, i) => (
                                <tr key={run.id} className="border-b-2 border-black hover:bg-brutal-yellow/20 transition-colors">
                                    <td className="p-4 border-r-2 border-dashed border-black">{run.id}</td>
                                    <td className="p-4 border-r-2 border-dashed border-black">{run.date}</td>
                                    <td className="p-4 border-r-2 border-dashed border-black">{run.partner}</td>
                                    <td className="p-4 border-r-2 border-dashed border-black text-right">{run.stops}</td>
                                    <td className="p-4 border-r-2 border-dashed border-black">
                                        <span className={`px-2 py-1 text-xs border-2 border-black ${run.status === 'COMPLETED' ? 'bg-success' : run.status === 'IN PROGRESS' ? 'bg-brutal-yellow' : 'bg-gray-200'}`}>
                                            {run.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <BrutalButton variant="outline" className="text-xs px-2 py-1 h-8">VIEW</BrutalButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </BrutalCard>
        </div>
    );
}
