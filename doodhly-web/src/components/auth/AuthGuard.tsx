"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

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
                // User logged in but wrong role
                console.warn(`Access Denied: User role ${user.role} not in [${allowedRoles}]`);
                setIsAuthorized(false); // Triggers "Access Denied" view
                return;
            }

            // 3. Check Onboarding (Specific to Customers)
            if (user.role === 'CUSTOMER' && !user.name && pathname !== '/app/onboarding') {
                router.push('/app/onboarding');
                return;
            }

            // 4. Authorized
            setIsAuthorized(true);
        }
    }, [user, loading, router, pathname, allowedRoles]);

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream/50">
                <Loader2 className="h-10 w-10 animate-spin text-brand-blue" />
            </div>
        );
    }

    // Role Mismatch State
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 text-center mb-6">You account type ({user.role}) does not have permission to view this page.</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                >
                    Go Home
                </button>
            </div>
        );
    }

    // Not authorized yet (waiting for effect or redirect)
    if (!user) {
        return null; // Or a spinner, but return null prevents flash content
    }

    return <>{children}</>;
}
