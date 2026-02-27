"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { MapPin, Plus, Trash2, Loader2, Home, Briefcase, Map as MapIcon, Navigation, XCircle, CheckCircle2 } from "lucide-react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import MapPicker from "@/components/MapPicker";
import { useGeolocation } from "@/hooks/useGeolocation";
import { reverseGeocode } from "@/lib/geo";
import { cn } from "@/lib/utils";

interface Address {
    id: number;
    name?: string;
    street: string;
    city: string;
    lat?: number;
    lng?: number;
    accuracy?: number;
    is_default?: boolean;
}

export default function AddressesPage() {
    const [fetchState, setFetchState] = useState<{ addresses: Address[]; loading: boolean }>({
        addresses: [],
        loading: true,
    });
    const [geoUpdatingId, setGeoUpdatingId] = useState<number | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: "Home", street: "", city: "Sakti", lat: null as number | null, lng: null as number | null, accuracy: null as number | null });

    const [pinModal, setPinModal] = useState<{ id: number; lat: number | null; lng: number | null; accuracy: number | null } | null>(null);

    const { getPosition, loading: geoLoading, coords, accuracy: geoAccuracy, error: geoError } = useGeolocation();

    const fetchAddresses = async () => {
        setFetchState(prev => ({ ...prev, loading: true }));
        try {
            const data = await api.get<Address[]>('/customer/addresses');
            setFetchState({ addresses: data, loading: false });
        } catch (e) {
            console.error(e);
            setFetchState(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    useEffect(() => {
        if (coords && pinModal) {
            setPinModal(prev => prev ? { ...prev, lat: coords.latitude, lng: coords.longitude, accuracy: geoAccuracy } : null);
        } else if (coords && showAdd) {
            setNewAddress(prev => ({ ...prev, lat: coords.latitude, lng: coords.longitude, accuracy: geoAccuracy }));
            handleReverseGeocode(coords.latitude, coords.longitude);
        }
    }, [coords, geoAccuracy]);

    const handleReverseGeocode = async (lat: number, lng: number) => {
        const result = await reverseGeocode(lat, lng);
        if (result) {
            setNewAddress(prev => ({
                ...prev,
                street: result.street || result.display_name.split(',')[0] || prev.street,
                city: result.city || prev.city
            }));
        }
    };

    const handleSaveGeotag = async () => {
        if (!pinModal || pinModal.lat === null || pinModal.lng === null) return;

        setGeoUpdatingId(pinModal.id);
        const tempId = pinModal.id;
        try {
            await api.put(`/customer/addresses/${tempId}/geotag`, {
                lat: pinModal.lat,
                lng: pinModal.lng,
                accuracy: pinModal.accuracy
            });
            setPinModal(null);
            fetchAddresses();
            alert("✅ Pin updated successfully!");
        } catch (e) {
            alert("Failed to update pin");
        } finally {
            setGeoUpdatingId(null);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/customer/addresses', newAddress);
            setShowAdd(false);
            setNewAddress({ name: "Home", street: "", city: "Sakti", lat: null, lng: null, accuracy: null });
            fetchAddresses();
        } catch (e) {
            alert("Failed to add address");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            await api.delete(`/customer/addresses/${id}`);
            fetchAddresses();
        } catch (e) {
            alert("Delete failed");
        }
    };

    if (fetchState.loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand-blue" /></div>;

    return (
        <LazyMotion features={domAnimation}>
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex justify-between items-center">
                <h1 className="font-serif text-3xl font-bold text-brand-blue">My Addresses</h1>
                <Button onClick={() => setShowAdd(true)} className="gap-2 h-12 px-6 rounded-2xl shadow-lg shadow-brand-blue/10">
                    <Plus className="w-5 h-5" /> Add New
                </Button>
            </header>

            {showAdd && (
                <GlassCard className="p-8 border-brand-blue/20 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-brand-blue">Add New Delivery Point</h2>
                        <button onClick={() => setShowAdd(false)}><XCircle className="text-slate-300" /></button>
                    </div>

                    <div className="space-y-4">
                        <MapPicker
                            initialLat={newAddress.lat || undefined}
                            initialLng={newAddress.lng || undefined}
                            accuracy={newAddress.accuracy}
                            onLocationSelect={(lat, lng, acc) => {
                                setNewAddress(prev => ({ ...prev, lat, lng, accuracy: acc || prev.accuracy }));
                                if (acc === null) handleReverseGeocode(lat, lng);
                            }}
                        />

                        <button
                            type="button"
                            onClick={() => getPosition({ enableHighAccuracy: true, timeout: 20000 }, true)}
                            disabled={geoLoading}
                            className={cn(
                                "w-full h-14 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all font-bold",
                                newAddress.accuracy && newAddress.accuracy <= 50 ? "bg-green-50 border-green-200 text-green-600" : "bg-brand-blue/5 border-brand-blue/20 text-brand-blue"
                            )}
                        >
                            {geoLoading ? <Loader2 className="animate-spin" /> : <><Navigation size={18} /> {newAddress.accuracy ? "Relocate Me" : "Use High-Precision GPS"}</>}
                        </button>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {["Home", "Office", "Other"].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setNewAddress({ ...newAddress, name: type })}
                                    className={`py-3 rounded-2xl border text-sm font-bold transition-all ${newAddress.name === type ? "bg-brand-blue text-white border-brand-blue shadow-md" : "bg-white text-slate-400 border-slate-100"}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Street, Building, Landmark"
                            required
                            className="w-full h-14 px-4 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all"
                            value={newAddress.street}
                            onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                        />
                        <div className="flex gap-3 pt-2">
                            <Button type="submit" className="flex-1 h-14 rounded-2xl" disabled={!newAddress.street}>Save Address</Button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <div className="space-y-4">
                {fetchState.addresses.length === 0 ? (
                    <GlassCard className="p-12 text-center border-dashed border-2 border-gray-100">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No addresses saved yet</p>
                    </GlassCard>
                ) : (
                    fetchState.addresses.map(addr => (
                        <GlassCard key={addr.id} className="p-6 flex items-center justify-between group hover:border-brand-blue/30 transition-all cursor-default">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-brand-blue/5 rounded-2xl text-brand-blue shadow-inner">
                                    {addr.name === "Home" ? <Home className="w-6 h-6" /> : addr.name === "Office" ? <Briefcase className="w-6 h-6" /> : <MapIcon className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide text-sm">
                                        {addr.name || "Address"}
                                        {addr.is_default && <span className="bg-brand-blue/10 text-brand-blue text-[9px] px-2 py-0.5 rounded-full font-black">DEFAULT</span>}
                                        {addr.lat && <span className="text-[10px] text-green-500 font-black flex items-center gap-0.5"><CheckCircle2 size={12} /> TAGGED</span>}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-1">{addr.street}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPinModal({ id: addr.id, lat: addr.lat || null, lng: addr.lng || null, accuracy: addr.accuracy || null })}
                                    className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl hover:bg-brand-blue hover:text-white transition-all flex items-center gap-2"
                                    title="Precision Geotag"
                                >
                                    <MapPin className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(addr.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            {pinModal && (
                <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <m.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-8 space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-serif text-2xl font-bold text-brand-blue">Pinpoint Location</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Adjust delivery pin for accuracy</p>
                            </div>
                            <button onClick={() => setPinModal(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <XCircle className="text-slate-300 w-8 h-8" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <MapPicker
                                initialLat={pinModal.lat || undefined}
                                initialLng={pinModal.lng || undefined}
                                accuracy={pinModal.accuracy}
                                onLocationSelect={(lat, lng, acc) => setPinModal(prev => prev ? { ...prev, lat, lng, accuracy: acc || prev.accuracy } : null)}
                            />

                            <button
                                type="button"
                                onClick={() => getPosition({ enableHighAccuracy: true, timeout: 20000 }, true)}
                                disabled={geoLoading}
                                className={cn(
                                    "w-full h-16 border-2 border-dashed rounded-3xl flex items-center justify-center gap-3 transition-all font-black text-sm",
                                    pinModal.accuracy && pinModal.accuracy <= 50 ? "bg-green-50 border-green-200 text-green-600 shadow-sm" : "bg-brand-blue/5 border-brand-blue/20 text-brand-blue"
                                )}
                            >
                                {geoLoading ? <Loader2 className="animate-spin" /> : <><Navigation size={20} /> Use High-Precision GPS</>}
                            </button>

                            {geoError && <p className="text-[10px] text-red-500 font-bold text-center">⚠️ {geoError}</p>}
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button
                                onClick={handleSaveGeotag}
                                className="flex-1 h-16 rounded-3xl font-black text-lg shadow-xl shadow-brand-blue/20"
                                disabled={geoUpdatingId === pinModal.id || pinModal.lat === null}
                            >
                                {geoUpdatingId === pinModal.id ? <Loader2 className="animate-spin" /> : "Save Delivery Pin"}
                            </Button>
                        </div>
                    </m.div>
                </div>
            )}
        </div>
        </LazyMotion>
    );
}
