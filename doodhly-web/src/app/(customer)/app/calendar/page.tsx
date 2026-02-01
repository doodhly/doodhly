"use client";

import { useEffect, useState } from "react";
import { getMonthlyDeliveries, DailyDelivery } from "@/lib/deliveries";
import { CalendarView } from "@/components/customer/CalendarView";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [deliveries, setDeliveries] = useState<DailyDelivery[]>([]);
    const [loading, setLoading] = useState(true);

    // Derive month/year
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const fetchCalendar = async () => {
        setLoading(true);
        try {
            // API expects 1-indexed month
            const data = await getMonthlyDeliveries(month + 1, year);
            setDeliveries(data);
        } catch (err) {
            console.error("Failed to load calendar", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendar();
    }, [currentDate]);

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif text-brand-blue">Daily Deliveries</h1>

                <div className="flex items-center gap-4 bg-white rounded-lg shadow-sm border p-1">
                    <button onClick={prevMonth} className="px-3 py-1 hover:bg-gray-100 rounded">←</button>
                    <span className="font-bold min-w-[120px] text-center">
                        {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="px-3 py-1 hover:bg-gray-100 rounded">→</button>
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center text-gray-400 bg-white rounded-lg border">
                    Loading Calendar...
                </div>
            ) : (
                <CalendarView currentDate={currentDate} deliveries={deliveries} />
            )}
        </div>
    );
}
