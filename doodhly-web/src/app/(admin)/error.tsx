"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Admin Dashboard Error]:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Admin Dashboard Error
                </h2>

                <p className="text-gray-600 mb-6">
                    An error occurred in the admin dashboard. Please try refreshing.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <RotateCcw size={18} />
                        Try Again
                    </button>

                    <button
                        onClick={() => window.location.href = '/admin/summary'}
                        className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors py-2"
                    >
                        <Home size={16} />
                        Back to Dashboard
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left overflow-auto text-xs font-mono">
                        <p className="font-bold mb-2">Error Details:</p>
                        <p className="text-red-600">{error.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
