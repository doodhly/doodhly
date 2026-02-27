import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="block text-sm font-black uppercase tracking-widest text-black mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-white border-black border px-4 py-4 font-mono text-lg placeholder:text-gray-400 focus:outline-none focus:bg-brutal-yellow/10 focus:shadow-[4px_4px_0px_#000] transition-all disabled:opacity-50 disabled:bg-gray-100",
                        error && "border-error bg-red-50 text-error placeholder:text-red-300",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs font-bold text-white bg-error inline-block px-2 py-1 border-black border mt-1">
                        ⚠ {error.toUpperCase()}
                    </p>
                )}
            </div>
        );
    }
);

BrutalInput.displayName = "BrutalInput";

export { BrutalInput };
