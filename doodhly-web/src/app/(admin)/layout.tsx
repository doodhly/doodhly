"use client";

import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Milk,
    Users,
    CalendarClock,
    LogOut,
    Menu,
    X,
    Bell,
    Loader2,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Run Sheets", href: "/admin/run-sheets", icon: CalendarClock },
    { label: "Team & Users", href: "/admin/users", icon: ShieldAlert },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Products", href: "/admin/products", icon: Milk },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <AuthGuard allowedRoles={['ADMIN']}>
            <div className="flex min-h-screen bg-slate-50">
                {/* Sidebar */}
                <aside className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 transform border-r border-slate-800 shadow-2xl lg:shadow-none",
                    !isSidebarOpen && "-translate-x-full lg:translate-x-0 lg:w-20"
                )}>
                    <div className="flex flex-col h-full">
                        {/* Brand */}
                        <div className="p-6 flex items-center justify-between border-b border-slate-800">
                            <div className={cn("flex items-center gap-3", !isSidebarOpen && "lg:hidden")}>
                                <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                                    <span className="text-white font-black">D</span>
                                </div>
                                <span className="text-white font-bold tracking-tight text-xl">Doodhly <span className="text-brand-blue">Admin</span></span>
                            </div>
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded-md transition-colors">
                                {isSidebarOpen ? <X size={20} className="lg:hidden" /> : <Menu size={20} />}
                            </button>
                        </div>

                        {/* Nav Items */}
                        <nav className="flex-1 p-4 space-y-2 mt-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group",
                                            isActive
                                                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                                                : "hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <Icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                                        <span className={cn("transition-opacity", !isSidebarOpen && "lg:hidden font-semibold")}>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Profile / Logout */}
                        <div className="p-4 border-t border-slate-800">
                            <div className={cn("flex items-center gap-3 mb-4 px-2", !isSidebarOpen && "lg:hidden")}>
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                    <Users size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Super Admin</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium group"
                            >
                                <LogOut size={20} />
                                <span className={cn(!isSidebarOpen && "lg:hidden")}>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0">
                    {/* Topbar */}
                    <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 lg:px-8">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-md">
                            <Menu size={20} />
                        </button>

                        <div className="flex items-center gap-4 ml-auto">
                            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard >
    );
}
