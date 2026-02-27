"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LayoutDashboard, CalendarClock, ShieldAlert, Users, Milk, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { BrutalButton } from "@/components/brutal/BrutalButton";

const NAV_ITEMS = [
    { label: "DASHBOARD", href: "/admin", icon: LayoutDashboard },
    { label: "RUN SHEETS", href: "/admin/run-sheets", icon: CalendarClock },
    { label: "TEAM", href: "/admin/users", icon: ShieldAlert },
    { label: "CUSTOMERS", href: "/admin/customers", icon: Users },
    { label: "PRODUCTS", href: "/admin/products", icon: Milk },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <AuthGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-gray-100 flex">
                {/* Sidebar */}
                <aside className={`fixed md:static inset-y-0 left-0 bg-black text-white z-50 transition-all duration-300 flex flex-col border-r-4 border-black ${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}`}>
                    <div className="p-6 border-b-4 border-white/20 flex items-center justify-between">
                        {sidebarOpen ? (
                            <span className="font-sans font-black text-2xl uppercase tracking-widest text-white">
                                ADMIN<span className="text-brutal-primary">.</span>
                            </span>
                        ) : (
                            <span className="font-black text-2xl">A.</span>
                        )}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-white"><X /></button>
                    </div>

                    <div className="p-4 border-b-4 border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-brutal-primary border-2 border-white text-black font-black flex items-center justify-center shrink-0">
                                A
                            </div>
                            {sidebarOpen && (
                                <div className="overflow-hidden">
                                    <p className="font-mono font-bold text-sm truncate uppercase">{user?.name}</p>
                                    <p className="text-[10px] font-mono text-gray-400">SUPER USER</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 p-3 transition-all border-2 ${isActive
                                            ? "bg-white text-black border-white shadow-[4px_4px_0px_#brutal-primary]"
                                            : "border-transparent text-gray-400 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 3 : 2} />
                                    {sidebarOpen && <span className="font-mono font-bold uppercase text-sm">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t-4 border-white/20">
                        <button onClick={logout} className={`flex items-center gap-3 w-full p-2 text-error hover:text-white transition-colors font-bold uppercase ${!sidebarOpen && 'justify-center'}`}>
                            <LogOut className="w-5 h-5" />
                            {sidebarOpen && "LOGOUT"}
                        </button>
                    </div>
                </aside>

                {/* Mobile Toggle & Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="md:hidden h-16 bg-black text-white flex items-center px-4 border-b-4 border-black">
                        <button onClick={() => setSidebarOpen(true)} className="p-2"><Menu /></button>
                        <span className="ml-4 font-black text-xl uppercase">Admin Console</span>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
