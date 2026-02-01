"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { getUserSession, User } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    refreshSession: () => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const isPublicPage = pathname === "/" || pathname === "/login" || pathname.startsWith("/products");

    const refreshSession = async () => {
        setLoading(true);
        try {
            const sessionUser = await getUserSession();
            setUser(sessionUser);
        } catch (err) {
            console.error("Failed to fetch session", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSession();

        // Background heartbeat to refresh last_seen_at
        const interval = setInterval(async () => {
            if (localStorage.getItem('token')) {
                try {
                    const sessionUser = await getUserSession();
                    if (sessionUser) setUser(sessionUser);
                } catch (err) {
                    // Fail silently in background
                }
            }
        }, 4 * 60 * 1000); // 4 minutes

        return () => clearInterval(interval);
    }, []);

    const logout = async () => {
        try {
            await api.post("/auth/logout", {});
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            router.push('/login');
        }
    };

    // Helper to check if user has required role
    const hasRole = (role: string | string[]) => {
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
                    <p className="text-brand-blue font-serif font-bold animate-pulse text-lg">Doodhly</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, refreshSession, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAdmin = () => {
    const { user } = useAuth();
    return user?.role === 'ADMIN';
};

export const usePartner = () => {
    const { user } = useAuth();
    return user?.role === 'DELIVERY_PARTNER';
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
