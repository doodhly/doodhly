"use client";

import { cn } from "@/lib/utils";
import { DailyDelivery } from "@/lib/deliveries";

interface CalendarViewProps {
    currentDate: Date;
    deliveries: DailyDelivery[];
}

export function CalendarView({ currentDate, deliveries }: CalendarViewProps) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

    // Create array of empty slots for padding
    const paddingDays = Array.from({ length: firstDayOfMonth });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getDeliveryForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return deliveries.find((d) => d.date === dateStr);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-blue/5 overflow-hidden font-sans">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-brand-cream/30">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="py-3 text-center text-[10px] sm:text-xs font-bold text-brand-blue uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-gray-50/30">
                {paddingDays.map((_, i) => (
                    <div key={`pad-${month}-${year}-${i}`} className="min-h-[5rem] sm:min-h-[7rem] border-b border-r border-gray-100 bg-gray-50/20" />
                ))}

                {days.map((day) => {
                    const delivery = getDeliveryForDay(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                    // Status Colors
                    const statusColors = {
                        DELIVERED: "bg-green-100 text-green-700 border-green-200",
                        PENDING: "bg-blue-50 text-brand-blue border-blue-100",
                        SKIPPED: "bg-yellow-50 text-yellow-700 border-yellow-100",
                        UNDELIVERED: "bg-red-50 text-red-700 border-red-100" // Typo fix
                    };

                    const statusStyle = delivery ? statusColors[delivery.status as keyof typeof statusColors] : "";

                    return (
                        <div
                            key={day}
                            className={cn(
                                "min-h-[5rem] sm:min-h-[7rem] border-b border-r border-gray-100 p-1 sm:p-2 relative flex flex-col items-center hover:bg-white transition-colors cursor-pointer group",
                                isToday && "bg-white ring-1 ring-inset ring-brand-blue/20"
                            )}
                        >
                            <span className={cn(
                                "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 sm:mb-2 transition-transform group-hover:scale-110",
                                isToday ? "bg-brand-blue text-white shadow-sm" : "text-gray-500"
                            )}>
                                {day}
                            </span>

                            {delivery ? (
                                <div className="w-full flex flex-col items-center gap-1">
                                    {/* Mobile Dot Indicator */}
                                    <div className={cn(
                                        "h-2 w-2 rounded-full sm:hidden",
                                        delivery.status === "DELIVERED" ? "bg-green-500" :
                                            delivery.status === "SKIPPED" ? "bg-yellow-400" :
                                                delivery.status === "UNDELIVERED" ? "bg-red-500" : "bg-brand-blue"
                                    )} />

                                    {/* Desktop Status Pill */}
                                    <div className={cn(
                                        "hidden sm:block text-[10px] px-2 py-0.5 rounded-full border text-center w-full truncate font-medium",
                                        statusStyle
                                    )}>
                                        {delivery.status}
                                    </div>

                                    <div className="hidden sm:block text-[10px] text-gray-400 text-center leading-tight line-clamp-2">
                                        {delivery.items.map(i => `${i.quantity} ${i.productName}`).join(", ")}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
