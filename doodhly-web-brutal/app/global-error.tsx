"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Archivo_Black, Space_Grotesk } from "next/font/google";

// Load fonts manually since layout might fail
const archivo = Archivo_Black({ subsets: ["latin"], weight: "400" });
const space = Space_Grotesk({ subsets: ["latin"] });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical Global Error:", error);
    }, [error]);

    return (
        <html lang="en">
            <body className={`${archivo.className} min-h-screen flex items-center justify-center bg-brutal-bg p-4 overflow-hidden`}>
                <div className="max-w-lg w-full bg-white border-[4px] border-black shadow-[12px_12px_0px_#000] p-8 md:p-12 text-center relative">

                    <div className="w-24 h-24 bg-brutal-yellow border-[4px] border-black flex items-center justify-center mx-auto mb-8 shadow-[4px_4px_0px_#000]">
                        {/* SVG icon fallback since lucide might not load if everything is broken */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                        </svg>
                    </div>

                    <h2 className="text-6xl font-black uppercase mb-4 leading-none">
                        System<br />Crash.
                    </h2>

                    <p className={`${space.className} text-xl font-bold text-gray-500 mb-8 uppercase`}>
                        Critical Failure. Try forcing a reboot.
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => reset()}
                            className={`${space.className} w-full flex items-center justify-center gap-2 bg-brutal-blue text-black font-bold uppercase py-4 border-[4px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                            ATTEMPT RECOVERY
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className={`${space.className} w-full bg-white text-black font-bold uppercase py-4 border-[4px] border-black hover:bg-black hover:text-white transition-colors`}
                        >
                            FORCE RELOAD
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className={`mt-8 text-left ${space.className} text-xs font-mono bg-black text-red-500 p-4 border-[4px] border-red-500 overflow-auto max-h-40`}>
                            {error.message}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
