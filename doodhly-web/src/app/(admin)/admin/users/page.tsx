"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Users, Search, Filter, Plus, Loader2, Shield, Truck, UserCircle, Edit2, Check, X } from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface User {
    id: number;
    name: string | null;
    phone_hash: string;
    role: "CUSTOMER" | "ADMIN" | "DELIVERY_PARTNER";
    is_active: boolean;
    default_city_id: number | null;
    created_at: string;
    last_seen_at: string | null;
    balance: number | null;
}

interface UsersResponse {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
}

export default function AdminUsersPage() {
    const [fetchState, setFetchState] = useState<{ users: User[]; loading: boolean }>({
        users: [],
        loading: true,
    });
    const [filters, setFilters] = useState({ search: "", role: "ALL" });
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [editingRole, setEditingRole] = useState<{ userId: number; newRole: string } | null>(null);

    const [onboardForm, setOnboardForm] = useState({
        phone: "",
        name: "",
        role: "ADMIN" as "ADMIN" | "DELIVERY_PARTNER",
        default_city_id: 1
    });

    useEffect(() => {
        fetchUsers();
    }, [filters.role]);

    const fetchUsers = async () => {
        setFetchState(prev => ({ ...prev, loading: true }));
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append("search", filters.search);
            if (filters.role !== "ALL") params.append("role", filters.role);

            const data = await api.get<UsersResponse>(`/admin/users?${params.toString()}`);
            setFetchState(prev => ({ ...prev, users: data.users, loading: false }));
        } catch (error) {
            console.error("Failed to fetch users:", error);
            alert("Failed to load users");
            setFetchState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSearch = () => {
        fetchUsers();
    };

    const handleUpdateRole = async (userId: number, newRole: string) => {
        setEditingRole({ userId, newRole });
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            alert("Role updated successfully!");
            fetchUsers();
        } catch (error: any) {
            alert(`Failed to update role: ${error.message}`);
        } finally {
            setEditingRole(null);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFetchState(prev => ({ ...prev, loading: true }));
        try {
            const phone = `+91${onboardForm.phone}`;
            await api.post("/admin/users/create", {
                ...onboardForm,
                phone
            });
            alert("User created successfully!");
            setShowOnboardModal(false);
            setOnboardForm({ phone: "", name: "", role: "ADMIN", default_city_id: 1 });
            fetchUsers();
        } catch (error: any) {
            alert(`Failed to create user: ${error.message}`);
        } finally {
            setFetchState(prev => ({ ...prev, loading: false }));
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "ADMIN": return <Shield className="h-4 w-4" />;
            case "DELIVERY_PARTNER": return <Truck className="h-4 w-4" />;
            default: return <UserCircle className="h-4 w-4" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN": return "bg-red-100 text-red-800 border-red-200";
            case "DELIVERY_PARTNER": return "bg-blue-100 text-blue-800 border-blue-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <LazyMotion features={domAnimation}>
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <m.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Users className="h-8 w-8 text-brand-blue" />
                                User Management
                            </h1>
                            <p className="text-gray-500 mt-2">Manage users, roles, and onboard admins/partners</p>
                        </div>
                        <button
                            onClick={() => setShowOnboardModal(true)}
                            className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-brand-blue/90 transition-all shadow-lg"
                        >
                            <Plus className="h-5 w-5" />
                            Quick Onboard
                        </button>
                    </div>
                </m.div>

                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                            />
                        </div>
                        <div className="md:col-span-4 relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue appearance-none bg-white"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="CUSTOMER">Customers</option>
                                <option value="ADMIN">Admins</option>
                                <option value="DELIVERY_PARTNER">Delivery Partners</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <button
                                onClick={handleSearch}
                                className="w-full bg-brand-green text-white py-3 rounded-lg hover:bg-brand-green/90 transition-all font-medium"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassCard className="overflow-hidden p-0 border-white/40 shadow-xl" intensity="light">
                        {fetchState.loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                            </div>
                        ) : fetchState.users.length === 0 ? (
                            <div className="text-center py-20 text-brand-blue/60">
                                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-brand-blue/5 border-b border-brand-blue/10">
                                        <tr>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-brand-blue/70 uppercase tracking-widest">ID</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-brand-blue/70 uppercase tracking-widest">Name</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-brand-blue/70 uppercase tracking-widest">Phone</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-brand-blue/70 uppercase tracking-widest">Role</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-brand-blue/70 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-brand-blue/70 uppercase tracking-widest">City</th>
                                            <th className="px-6 py-5 text-right text-xs font-bold text-brand-blue/70 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-blue/5">
                                        {fetchState.users.map((user, index) => (
                                            <m.tr
                                                key={user.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-brand-blue/5 transition-colors group"
                                            >
                                                <td className="px-6 py-4 text-sm text-brand-blue/60 font-mono">#{user.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs ring-2 ring-white">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                                                        </div>
                                                        <span className="text-sm font-semibold text-brand-blue">
                                                            {user.name || <span className="opacity-50 italic">Unboxing...</span>}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-brand-blue/80 font-mono tracking-wide">{user.phone_hash}</td>
                                                <td className="px-6 py-4">
                                                    {editingRole?.userId === user.id ? (
                                                        <div className="flex items-center gap-2 bg-white/80 p-1 rounded-lg shadow-sm border border-brand-blue/10">
                                                            <select
                                                                value={editingRole.newRole}
                                                                onChange={(e) => setEditingRole({ ...editingRole, newRole: e.target.value })}
                                                                className="text-xs border-none bg-transparent focus:ring-0 text-brand-blue font-medium cursor-pointer"
                                                            >
                                                                <option value="CUSTOMER">Customer</option>
                                                                <option value="ADMIN">Admin</option>
                                                                <option value="DELIVERY_PARTNER">Partner</option>
                                                            </select>
                                                            <button
                                                                onClick={() => handleUpdateRole(user.id, editingRole.newRole)}
                                                                className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingRole(null)}
                                                                className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 group/role">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm backdrop-blur-sm",
                                                                user.role === 'ADMIN' ? 'bg-red-50/80 text-red-700 border-red-200' :
                                                                    user.role === 'DELIVERY_PARTNER' ? 'bg-blue-50/80 text-blue-700 border-blue-200' :
                                                                        'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                                                            )}>
                                                                {getRoleIcon(user.role)}
                                                                {user.role}
                                                            </span>
                                                            <button
                                                                onClick={() => setEditingRole({ userId: user.id, newRole: user.role })}
                                                                className="opacity-0 group-hover/role:opacity-100 p-1 text-brand-blue/40 hover:text-brand-blue transition-all"
                                                                title="Edit Role"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border",
                                                        user.is_active
                                                            ? "bg-green-50/50 text-green-700 border-green-200/50"
                                                            : "bg-red-50/50 text-red-700 border-red-200/50"
                                                    )}>
                                                        {user.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-brand-blue/60">
                                                    {user.default_city_id || <span className="opacity-30">-</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="text-brand-blue/60 hover:text-brand-blue text-sm font-semibold hover:underline decoration-brand-blue/30 underline-offset-4 transition-all"
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </m.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </GlassCard>
                </m.div>
            </div>

            {showOnboardModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <m.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Onboard User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label htmlFor="onboard-phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                                    <input
                                        id="onboard-phone"
                                        type="tel"
                                        required
                                        value={onboardForm.phone}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20"
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="onboard-name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    id="onboard-name"
                                    type="text"
                                    required
                                    value={onboardForm.name}
                                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="onboard-role" className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    id="onboard-role"
                                    value={onboardForm.role}
                                    onChange={(e) => setOnboardForm({ ...onboardForm, role: e.target.value as "ADMIN" | "DELIVERY_PARTNER" })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20"
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="DELIVERY_PARTNER">Delivery Partner</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="onboard-city-id" className="block text-sm font-medium text-gray-700 mb-2">City ID</label>
                                <input
                                    id="onboard-city-id"
                                    type="number"
                                    required
                                    value={onboardForm.default_city_id}
                                    onChange={(e) => setOnboardForm({ ...onboardForm, default_city_id: Number(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20"
                                    placeholder="1"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowOnboardModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={fetchState.loading}
                                    className="flex-1 bg-brand-blue text-white py-3 rounded-lg hover:bg-brand-blue/90 transition-all font-medium flex items-center justify-center gap-2"
                                >
                                    {fetchState.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create User"}
                                </button>
                            </div>
                        </form>
                    </m.div>
                </div>
            )}
        </div>
        </LazyMotion>
    );
}
