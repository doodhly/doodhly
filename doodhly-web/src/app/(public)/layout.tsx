"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-brand-cream/30">
            <header className="sticky top-0 z-50 w-full border-b border-brand-blue/5 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="font-serif text-2xl font-bold text-brand-blue tracking-tight">
                        Doodhly
                    </Link>
                    <nav className="flex gap-6 sm:gap-8 hidden md:flex">
                        <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">
                            Our Farm
                        </Link>
                        <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">
                            Products
                        </Link>
                        <Link href="/safety" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">
                            Safety
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link
                                href="/app/dashboard"
                                className="flex items-center gap-2 rounded-full border border-brand-blue/20 px-4 py-2 text-sm font-semibold text-brand-blue transition-all hover:bg-brand-blue/5"
                            >
                                <span className="h-2 w-2 rounded-full bg-brand-green"></span>
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    href="/login"
                                    className="rounded-full bg-brand-blue px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue/90 hover:shadow-md"
                                >
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1 w-full relative">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
                    </div>
                ) : (
                    children
                )}
            </main>
            <footer className="border-t border-brand-blue/5 bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <span className="font-serif text-xl font-bold text-brand-blue">Doodhly</span>
                            <p className="text-sm text-gray-500">Pure Cow Milk Delivery.</p>
                        </div>
                        <p className="text-center text-sm text-gray-400 md:text-right">
                            FSSAI Lic No. 12345678901234 <br />
                            © 2024 Maa Durga Dairy and Foods.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
