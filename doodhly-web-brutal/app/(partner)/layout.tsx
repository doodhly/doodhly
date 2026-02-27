"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    // Partner pages often have their own specific layout (map view etc), 
    // so we just provide the AuthGuard and a base container.
    return (
        <AuthGuard allowedRoles={['DELIVERY_PARTNER']}>
            <div className="min-h-screen bg-slate-950 text-white selection:bg-brutal-primary selection:text-black">
                {children}
            </div>
        </AuthGuard>
    );
}
