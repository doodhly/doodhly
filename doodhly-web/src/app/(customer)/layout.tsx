"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Home, Calendar, Wallet, User as UserIcon, LogOut, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { AuthGuard } from "@/components/auth/AuthGuard";

function CustomerSidebar({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isImpersonating } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleExitImpersonation = () => {
        // Clearing auth_token forces the layout/middleware to re-eval. 
        // This will redirect to login, where the admin can log back in as themselves,
        // or we could build a specific "/admin/revert" flow if we stored original admin token elsewhere.
        // For simplicity, we just log them out of the impersonated session.
        logout();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream/30">
                <Loader2 className="animate-spin text-brand-blue" />
            </div>
        );
    }

    // Navigation Links
    const navItems = [
        { name: "Home", href: "/app/dashboard", icon: Home },
        { name: "Calendar", href: "/app/calendar", icon: Calendar },
        { name: "Wallet", href: "/app/wallet", icon: Wallet },
        { name: "Profile", href: "/app/profile", icon: UserIcon },
    ];

    return (
        <div className="flex min-h-screen bg-[#FDFBF7]">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 bg-white/80 backdrop-blur-xl border-r border-brand-blue/5 z-50">
                <div className="p-8">
                    <Link href="/" className="font-serif text-3xl font-bold text-brand-blue tracking-tight">
                        Doodhly
                    </Link>
                </div>

                {/* User Snapshot in Sidebar */}
                {user && (
                    <div className="px-8 pb-6 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                                <span className="font-bold text-lg">{user.name?.charAt(0) || "U"}</span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{user.name || "Customer"}</p>
                                <p className="text-xs text-brand-blue/70 font-medium">+91 {user.phone?.slice(-4) || "----"}</p>
                            </div>
                        </div>
                    </div>
                )}

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-label={`Navigate to ${item.name}`}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all duration-200 group ${isActive
                                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20 translate-x-1"
                                    : "text-gray-500 hover:bg-brand-blue/5 hover:text-brand-blue"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-brand-blue"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 pb-24 md:pb-8 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
                {isImpersonating && (
                    <div className="mb-6 w-full bg-red-500 rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-6 z-40 border-2 border-red-600">
                        <div className="flex items-center gap-3 text-white">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-bold text-lg leading-tight">Admin Impersonation Mode Active</p>
                                <p className="text-sm font-medium text-red-100">You are acting as {user?.name || "this customer"}. All actions are audited.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleExitImpersonation}
                            className="bg-white text-red-600 font-bold px-6 py-2 rounded-xl text-sm hover:bg-red-50 transition-colors whitespace-nowrap"
                        >
                            Exit Session
                        </button>
                    </div>
                )}
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 flex justify-around p-2 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={`Navigate to ${item.name}`}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? "text-brand-blue" : "text-gray-400"
                                }`}
                        >
                            <div className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-brand-blue/10" : "bg-transparent"}`}>
                                <Icon className={`w-6 h-6 ${isActive ? "fill-current" : "stroke-current"}`} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard allowedRoles={['CUSTOMER']}>
            <CustomerSidebar>{children}</CustomerSidebar>
        </AuthGuard>
    );
}
