"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">
                    Something went wrong!
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    We apologize for the inconvenience. Our team has been notified of this issue.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <RotateCcw size={18} />
                        Try Again
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors py-2"
                    >
                        Return to Home
                    </button>
                </div>
            </div>

            {/* Dev Details (Hidden in Prod usually, but helpful here) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-gray-800 text-red-300 rounded-lg max-w-2xl text-left overflow-auto text-xs font-mono w-full">
                    <p className="font-bold text-white mb-2">Error Details:</p>
                    {error.message}
                    {error.stack && <pre className="mt-2 opacity-70">{error.stack}</pre>}
                </div>
            )}
        </div>
    );
}
