import { cn } from "@/lib/utils";
import { BrutalCard } from "./BrutalCard";

interface BrutalStatProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    className?: string;
    color?: string;
}

export function BrutalStat({ label, value, icon, trend, trendUp, className, color = "bg-white" }: BrutalStatProps) {
    return (
        <BrutalCard className={cn("flex flex-col justify-between min-h-[160px]", className)} color={color}>
            <div className="flex justify-between items-start">
                <span className="font-mono font-bold uppercase tracking-widest text-xs opacity-70 border-b-2 border-black pb-1">
                    {label}
                </span>
                {icon && <div className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_#000]">{icon}</div>}
            </div>

            <div className="mt-4">
                <div className="font-sans font-black text-5xl md:text-6xl tracking-tighter leading-[0.9]">
                    {value}
                </div>
                {trend && (
                    <div className={cn("inline-block mt-2 font-mono text-xs font-bold px-2 py-1 border border-black",
                        trendUp ? "bg-success text-black" : "bg-error text-white"
                    )}>
                        {trend}
                    </div>
                )}
            </div>
        </BrutalCard>
    );
}
