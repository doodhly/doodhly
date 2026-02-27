import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BrutalCardProps extends HTMLAttributes<HTMLDivElement> {
    color?: string; // Optional custom background color class
}

const BrutalCard = forwardRef<HTMLDivElement, BrutalCardProps>(
    ({ className, color = "bg-white", children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "border-black border shadow-brutal p-6 bg-white",
                    color,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

BrutalCard.displayName = "BrutalCard";

export { BrutalCard };
