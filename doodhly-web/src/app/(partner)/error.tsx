"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function PartnerError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Partner Dashboard Error]:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-yellow-400/30">
                <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    Partner App Error
                </h2>

                <p className="text-gray-300 mb-6">
                    Something went wrong. Please try refreshing the app.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold transition-colors"
                    >
                        <RotateCcw size={18} />
                        Try Again
                    </button>

                    <button
                        onClick={() => window.location.href = '/partner/route'}
                        className="flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors py-2"
                    >
                        <Home size={16} />
                        Back to Route
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-black rounded-lg text-left overflow-auto text-xs font-mono">
                        <p className="font-bold mb-2 text-yellow-400">Error Details:</p>
                        <p className="text-red-400">{error.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
