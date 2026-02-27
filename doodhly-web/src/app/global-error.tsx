"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
            <body className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">
                        System Error
                    </h2>

                    <p className="text-gray-500 mb-8 leading-relaxed">
                        A critical error prevents the application from loading. Please try refreshing or contact support.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => reset()}
                            className="w-full bg-brand-blue hover:bg-brand-blue/90"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            Force Reload
                        </Button>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-gray-900 text-red-400 rounded-lg text-left overflow-auto text-xs font-mono max-h-40">
                            {error.message}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
