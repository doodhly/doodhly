"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PartnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'DELIVERY_PARTNER')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'DELIVERY_PARTNER') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                    <p className="text-yellow-400 font-bold animate-pulse">Verifying Partner Access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* High Contrast Header */}
            <header className="bg-black p-4 flex justify-between items-center border-b border-gray-700">
                <h1 className="text-xl font-bold text-yellow-400">Doodhly Partner</h1>
                <div className="bg-green-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
                    Online
                </div>
            </header>

            {/* Main Content Area */}
            <main className="pb-16">
                {children}
            </main>

            {/* Action Bar (Footer) */}
            <nav className="fixed bottom-0 inset-x-0 bg-black border-t border-gray-700 p-4 flex justify-between">
                <button className="text-gray-400 hover:text-white flex flex-col items-center text-xs gap-1">
                    <span>📋</span> Route
                </button>
                <button className="text-gray-400 hover:text-white flex flex-col items-center text-xs gap-1">
                    <span>📦</span> History
                </button>
                <button className="text-gray-400 hover:text-white flex flex-col items-center text-xs gap-1">
                    <span>👤</span> Profile
                </button>
            </nav>
        </div>
    );
}
