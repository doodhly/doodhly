"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Home, Calendar, Wallet, User as UserIcon, LogOut, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function CustomerSidebar({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

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
            <main className="flex-1 md:ml-72 pb-24 md:pb-8 pt-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
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

function ProtectedCustomerLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!user.name && user.role === 'CUSTOMER' && pathname !== '/app/onboarding') {
                router.push('/app/onboarding');
            }
        }
    }, [user, loading, router, pathname]);

    return <CustomerSidebar>{children}</CustomerSidebar>;
}

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedCustomerLayout>{children}</ProtectedCustomerLayout>
    );
}
