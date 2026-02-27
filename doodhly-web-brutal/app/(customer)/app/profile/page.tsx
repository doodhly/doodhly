"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { LogOut, User, MapPin, Phone, Mail, Award, Edit } from "lucide-react";

export default function ProfilePage() {
    const { logout } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<any>('/customer/profile')
            .then(res => setProfile(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-4xl bg-brutal-bg uppercase">LOADING...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12 pb-20">
            <div className="border-b-4 border-black pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="font-sans font-black text-6xl md:text-8xl mb-2 flex items-center gap-4 uppercase">
                        PROFILE.
                    </h1>
                </div>
                <BrutalButton variant="outline" onClick={logout} className="hover:bg-error hover:text-white mb-2 md:mb-0">
                    <LogOut className="w-5 h-5 mr-2" /> LOGOUT
                </BrutalButton>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <BrutalCard className="border-4 bg-brutal-blue shadow-[8px_8px_0px_#000]">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 border-b-4 border-black pb-6">
                        <div className="w-24 h-24 bg-white border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center font-black text-5xl shrink-0">
                            {profile?.name?.charAt(0) || "U"}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="font-sans font-black text-3xl uppercase leading-none mb-2">{profile?.name || "CUSTOMER"}</h2>
                            <p className="font-mono font-bold text-xl">+91 {profile?.phone_hash}</p>
                        </div>
                    </div>

                    <div className="space-y-4 font-mono font-bold uppercase text-sm md:text-base">
                        <div className="flex justify-between items-center border-b-2 border-dashed border-black pb-2">
                            <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> EMAIL</span>
                            <span className="truncate max-w-[150px] md:max-w-[200px] text-right">{profile?.email || "NOT PROVIDED"}</span>
                        </div>
                        <div className="flex justify-between items-center border-b-2 border-dashed border-black pb-2">
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> DEFAULT PIN</span>
                            <span>500081</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="flex items-center gap-2"><Award className="w-4 h-4" /> REFERRAL</span>
                            <span className="bg-black text-white px-2 py-1">{profile?.referral_code || "------"}</span>
                        </div>
                    </div>
                </BrutalCard>

                <div className="space-y-8">
                    <BrutalCard className="border-4 bg-brutal-yellow shadow-[6px_6px_0px_#000] flex justify-between items-center h-[160px]">
                        <div>
                            <p className="font-mono font-bold uppercase tracking-widest text-sm mb-1">YOUR TIER</p>
                            <h3 className="font-black text-4xl md:text-5xl uppercase">{profile?.current_tier || 'SILVER'}</h3>
                        </div>
                        <span className="text-5xl md:text-6xl">👑</span>
                    </BrutalCard>

                    <BrutalCard className="border-4 bg-brutal-pink shadow-[6px_6px_0px_#000] flex justify-between items-center h-[160px]">
                        <div>
                            <p className="font-mono font-bold uppercase tracking-widest text-sm mb-1">STREAK</p>
                            <h3 className="font-black text-4xl md:text-5xl uppercase">{profile?.streak_count || 0} DAYS</h3>
                        </div>
                        <span className="text-5xl md:text-6xl">🔥</span>
                    </BrutalCard>
                </div>
            </div>

            <BrutalButton className="w-full text-xl h-16 bg-white border-4 shadow-[6px_6px_0px_#000]">
                <Edit className="w-6 h-6 mr-2" /> EDIT PROFILE INFO
            </BrutalButton>
        </div>
    );
}
