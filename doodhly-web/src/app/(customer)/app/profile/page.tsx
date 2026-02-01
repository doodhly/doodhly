"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { User, MapPin, Phone, LogOut, Shield, ChevronRight, Edit2, Loader2, Mail } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const { logout } = useAuth();
    const [user, setUser] = useState<{ name: string, phone_hash: string, email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get<{ name: string, phone_hash: string, email: string }>('/customer/profile');
                setUser(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand-blue" /></div>;

    const displayName = user?.name || "Valued Customer";
    const displayPhone = user?.phone_hash ? `+91 ${user.phone_hash}` : "";
    const displayEmail = user?.email || "No email provided";

    const sections = [
        {
            title: "Account Settings",
            items: [
                { icon: MapPin, label: "Manage Addresses", action: () => router.push('/app/addresses') },
                { icon: Shield, label: "Privacy & Terms", action: () => { } }
            ]
        },
        {
            title: "Support",
            items: [
                { icon: Phone, label: "Contact Support", action: () => { } },
            ]
        }
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="font-serif text-3xl font-bold text-brand-blue">My Profile</h1>
            </header>

            {/* User Info Card */}
            <GlassCard className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-brand-cream flex items-center justify-center text-brand-blue border-4 border-white shadow-lg">
                            <User className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                            <p className="text-gray-500 font-medium">{displayPhone}</p>
                            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1"><Mail className="w-3 h-3" /> {displayEmail}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/app/onboarding')}
                        className="gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit User
                    </Button>
                </div>
            </GlassCard>

            {/* Menu Sections */}
            <div className="space-y-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider ml-2">{section.title}</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {section.items.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={i}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                                        onClick={item.action}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-gray-700">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="destructive" onClick={logout} className="w-full h-12 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-none">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
            </Button>

            <p className="text-center text-xs text-gray-400">Version 1.0.0 • Build 2024.1</p>
        </div>
    );
}
