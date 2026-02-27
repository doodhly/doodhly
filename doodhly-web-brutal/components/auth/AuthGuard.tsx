"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            // 1. Check Authentication
            if (!user) {
                // Redirect to login, saving current path for return
                const returnUrl = encodeURIComponent(pathname);
                router.push(`/login?returnUrl=${returnUrl}`);
                return;
            }

            // 2. Check Role (if specified)
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                console.warn(`Access Denied: User role ${user.role} not in [${allowedRoles}]`);
                setIsAuthorized(false);
                return;
            }

            // 3. Authorized
            setIsAuthorized(true);
        }
    }, [user, loading, router, pathname, allowedRoles]);

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brutal-bg">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-black mb-4 mx-auto" strokeWidth={3} />
                    <div className="font-mono font-bold text-xl uppercase tracking-widest">Verifying Identity...</div>
                </div>
            </div>
        );
    }

    // Role Mismatch State
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brutal-bg p-4">
                <BrutalCard className="max-w-md w-full border-4 shadow-[8px_8px_0px_#000] text-center p-8 bg-error/20">
                    <ShieldAlert className="h-24 w-24 text-black mb-6 mx-auto" strokeWidth={2} />
                    <h1 className="font-sans font-black text-5xl uppercase mb-4">Access Denied</h1>
                    <p className="font-mono font-bold text-lg mb-8 uppercase">
                        Your role ({user.role}) is not authorized here.
                    </p>
                    <BrutalButton
                        onClick={() => router.push('/')}
                        className="w-full h-16 border-4 shadow-[4px_4px_0px_#000]"
                    >
                        GO HOME
                    </BrutalButton>
                </BrutalCard>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
