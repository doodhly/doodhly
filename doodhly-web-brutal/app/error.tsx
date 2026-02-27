"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Brutal Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-brutal-bg bg-brutal-noise">
            <BrutalCard className="max-w-lg w-full bg-white border-4 shadow-[12px_12px_0px_#FF0000] p-8 md:p-12 relative overflow-hidden">

                {/* Decorative Background Icon */}
                <AlertCircle className="absolute -right-8 -bottom-8 w-48 h-48 text-red-50 -rotate-12 z-0 pointer-events-none" />

                <div className="relative z-10 text-center">
                    <div className="inline-block bg-error text-white border-4 border-black p-4 mb-8 shadow-[4px_4px_0px_#000]">
                        <AlertCircle className="w-12 h-12" strokeWidth={2.5} />
                    </div>

                    <h2 className="font-sans font-black text-5xl md:text-6xl mb-4 leading-none uppercase">
                        Something<br />Broke.
                    </h2>

                    <p className="font-mono font-bold text-lg text-gray-500 mb-8 uppercase tracking-wide">
                        The code gave up. Our bad.
                    </p>

                    <div className="flex flex-col gap-4">
                        <BrutalButton
                            onClick={reset}
                            className="w-full text-xl h-16 border-4 shadow-[4px_4px_0px_#000] hover:bg-brutal-yellow"
                        >
                            <RotateCcw className="mr-3 w-6 h-6" strokeWidth={2.5} />
                            TRY AGAIN
                        </BrutalButton>

                        <BrutalButton
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="w-full text-lg h-14 border-4 hover:bg-black hover:text-white"
                        >
                            <Home className="mr-3 w-5 h-5" strokeWidth={2.5} />
                            RETURN HOME
                        </BrutalButton>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-12 text-left bg-black text-red-500 p-4 border-4 border-red-500 font-mono text-xs overflow-auto max-h-60 shadow-[4px_4px_0px_#FF0000]">
                            <p className="font-bold text-white border-b-2 border-red-500 pb-2 mb-2 uppercase">Debug Info:</p>
                            {error.message}
                            {error.stack && <pre className="mt-2 text-gray-500 whitespace-pre-wrap">{error.stack}</pre>}
                        </div>
                    )}
                </div>
            </BrutalCard>
        </div>
    );
}
