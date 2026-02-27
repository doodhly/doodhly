import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center font-sans font-black uppercase tracking-wider border-black border transition-all active:translate-x-brutal-pressed active:translate-y-brutal-pressed active:shadow-none disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none";

        const variants = {
            primary: "bg-brutal-primary text-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[4px] hover:translate-y-[4px]",
            secondary: "bg-brutal-secondary text-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[4px] hover:translate-y-[4px]",
            accent: "bg-brutal-accent text-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[4px] hover:translate-y-[4px]",
            outline: "bg-white text-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[4px] hover:translate-y-[4px]",
            ghost: "bg-transparent border-transparent hover:bg-black/5 shadow-none active:translate-x-0 active:translate-y-0 text-black",
        };

        const sizes = {
            sm: "text-xs px-4 py-2 h-10",
            md: "text-sm px-6 py-3 h-14",
            lg: "text-lg px-8 py-4 h-16 min-w-[200px]",
            icon: "h-14 w-14 p-0",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {children}
            </button>
        );
    }
);

BrutalButton.displayName = "BrutalButton";

export { BrutalButton };
