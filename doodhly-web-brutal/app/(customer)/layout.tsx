"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Home, Calendar, Wallet, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { BrutalButton } from "@/components/brutal/BrutalButton";

const NAV_ITEMS = [
    { name: "HOME", href: "/app/dashboard", icon: Home },
    { name: "CALENDAR", href: "/app/calendar", icon: Calendar },
    { name: "WALLET", href: "/app/wallet", icon: Wallet },
    { name: "PROFILE", href: "/app/profile", icon: User },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <AuthGuard allowedRoles={['CUSTOMER']}>
            <div className="min-h-screen bg-brutal-bg flex flex-col md:flex-row">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex w-80 flex-col fixed inset-y-0 bg-white border-r-4 border-black z-40">
                    <div className="p-8 border-b-4 border-black">
                        <Link href="/" className="font-sans font-black text-4xl tracking-tighter uppercase relative inline-block hover:scale-105 transition-transform">
                            DOODHLY
                            <span className="absolute -top-2 -right-4 text-xs bg-brutal-primary text-white px-1 border-2 border-black rotate-12">BETA</span>
                        </Link>
                    </div>

                    <div className="p-6 border-b-4 border-black bg-brutal-yellow/20">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 border-2 border-black bg-white flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#000]">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold font-mono uppercase truncate">{user?.name || "Customer"}</p>
                                <p className="text-xs font-mono text-gray-500 font-bold">+91 {user?.phone?.slice(-4) || "----"}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-4 py-4 border-2 border-black transition-all duration-200 font-mono font-bold uppercase ${isActive
                                            ? "bg-black text-white shadow-[4px_4px_0px_#888]"
                                            : "bg-white hover:bg-brutal-blue hover:text-black hover:translate-x-1 hover:shadow-[4px_4px_0px_#000]"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" strokeWidth={3} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-6 border-t-4 border-black mt-auto">
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-black font-bold uppercase hover:bg-error hover:text-white transition-all shadow-[2px_2px_0px_#000] active:translate-y-[2px] active:shadow-none"
                        >
                            <LogOut className="w-5 h-5" strokeWidth={3} />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Mobile Header */}
                <header className="md:hidden h-20 bg-white border-b-4 border-black flex items-center justify-between px-4 sticky top-0 z-50">
                    <Link href="/" className="font-sans font-black text-3xl tracking-tighter uppercase">
                        DOODHLY
                    </Link>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 border-2 border-black bg-brutal-yellow shadow-[2px_2px_0px_#000] active:translate-y-[2px] active:shadow-none">
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 top-20 bg-white z-40 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-10 duration-200">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-4 px-6 py-6 border-4 border-black text-xl font-black uppercase shadow-[4px_4px_0px_#000] ${pathname === item.href ? 'bg-brutal-primary text-white' : 'bg-white'}`}
                            >
                                <item.icon className="w-6 h-6" /> {item.name}
                            </Link>
                        ))}
                        <button onClick={logout} className="mt-auto w-full py-6 border-4 border-black bg-error text-white font-black uppercase flex justify-center gap-2 shadow-[4px_4px_0px_#000]">
                            <LogOut /> SIGN OUT
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 md:ml-80 p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
                    {children}
                </main>

                {/* Mobile Bottom Nav (Sticky) */}
                <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t-4 border-black flex justify-around p-2 z-40">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center p-2 transition-transform active:scale-90 ${isActive ? 'text-brutal-primary' : 'text-gray-400'}`}
                            >
                                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[3px]' : 'stroke-2'}`} />
                                <span className="text-[10px] font-black uppercase mt-1">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </AuthGuard>
    );
}
