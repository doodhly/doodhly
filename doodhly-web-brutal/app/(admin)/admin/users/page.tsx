"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BrutalCard } from "@/components/brutal/BrutalCard";
import { BrutalButton } from "@/components/brutal/BrutalButton";
import { BrutalInput } from "@/components/brutal/BrutalInput";
import { Users, Search, Filter, Plus, Loader2, Shield, Truck, User, Check, X } from "lucide-react";

interface UserType {
    id: number;
    name: string | null;
    phone_hash: string;
    role: "CUSTOMER" | "ADMIN" | "DELIVERY_PARTNER";
    is_active: boolean;
    default_city_id: number | null;
}

interface UsersResponse {
    users: UserType[];
    total: number;
    page: number;
    totalPages: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: "", role: "ALL" });
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [editingRole, setEditingRole] = useState<{ userId: number; newRole: string } | null>(null);

    const [onboardForm, setOnboardForm] = useState({
        phone: "",
        name: "",
        role: "ADMIN" as "ADMIN" | "DELIVERY_PARTNER",
        default_city_id: 1
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append("search", filters.search);
            if (filters.role !== "ALL") params.append("role", filters.role);

            const data = await api.get<UsersResponse>(`/admin/users?${params.toString()}`);
            setUsers(data.users);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filters.role]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
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
        }
    };

    const handleUpdateRole = async (userId: number, newRole: string) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            fetchUsers();
            setEditingRole(null);
        } catch (error: any) {
            alert(`Failed to update role: ${error.message}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b-4 border-black pb-8">
                <div>
                    <h1 className="font-sans font-black text-6xl md:text-8xl uppercase leading-[0.9]">
                        User<br />Roster.
                    </h1>
                </div>
                <BrutalButton onClick={() => setShowOnboardModal(true)} className="h-16 shadow-[4px_4px_0px_#000]">
                    <Plus className="mr-2" strokeWidth={3} /> QUICK ONBOARD
                </BrutalButton>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch} className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                    <BrutalInput
                        placeholder="SEARCH NAME OR PHONE..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="h-14"
                    />
                </div>
                <div className="md:col-span-3">
                    <div className="relative h-full">
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full h-14 border-4 border-black bg-white px-4 font-mono font-bold uppercase appearance-none focus:outline-none focus:bg-brutal-bg"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="CUSTOMER">Customers</option>
                            <option value="ADMIN">Admins</option>
                            <option value="DELIVERY_PARTNER">Partners</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
                <div className="md:col-span-1">
                    <BrutalButton type="submit" className="w-full h-14 bg-black text-white hover:bg-gray-800">
                        GO
                    </BrutalButton>
                </div>
            </form>

            {/* Users Table */}
            <div className="border-4 border-black bg-white shadow-[8px_8px_0px_#000] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center font-black text-2xl uppercase">LOADING DATA...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-black text-white font-mono uppercase text-sm sticky top-0">
                                <tr>
                                    <th className="p-4 border-b-4 border-black">ID</th>
                                    <th className="p-4 border-b-4 border-black">Name</th>
                                    <th className="p-4 border-b-4 border-black">Role</th>
                                    <th className="p-4 border-b-4 border-black">City</th>
                                    <th className="p-4 border-b-4 border-black text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-4 divide-black font-mono font-bold">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-brutal-bg group">
                                        <td className="p-4 border-r-4 border-black text-xs">#{user.id}</td>
                                        <td className="p-4 border-r-4 border-black">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                                                </div>
                                                <span>{user.name || "Unknown"}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{user.phone_hash}</div>
                                        </td>
                                        <td className="p-4 border-r-4 border-black">
                                            {editingRole?.userId === user.id ? (
                                                <div className="flex gap-2">
                                                    <select
                                                        value={editingRole.newRole}
                                                        onChange={(e) => setEditingRole({ ...editingRole, newRole: e.target.value })}
                                                        className="border-2 border-black p-1 text-xs"
                                                    >
                                                        <option value="CUSTOMER">CSTMR</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                        <option value="DELIVERY_PARTNER">PTRNR</option>
                                                    </select>
                                                    <button onClick={() => handleUpdateRole(user.id, editingRole.newRole)} className="bg-success border-2 border-black p-1"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingRole(null)} className="bg-error border-2 border-black p-1 text-white"><X className="w-4 h-4" /></button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-center">
                                                    <span className={`px-2 py-1 border-2 border-black text-xs uppercase ${user.role === 'ADMIN' ? 'bg-brutal-pink' :
                                                            user.role === 'DELIVERY_PARTNER' ? 'bg-brutal-blue' : 'bg-gray-100'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                    <button
                                                        onClick={() => setEditingRole({ userId: user.id, newRole: user.role })}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black hover:text-white transition-all"
                                                    >
                                                        <div className="text-[10px] uppercase underline">EDIT</div>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 border-r-4 border-black text-sm">{user.default_city_id || "-"}</td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-block px-2 py-1 border-2 border-black text-xs uppercase ${user.is_active ? 'bg-success' : 'bg-gray-300'}`}>
                                                {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Onboard Modal */}
            {showOnboardModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <BrutalCard className="w-full max-w-md bg-white border-4 p-8 relative shadow-[16px_16px_0px_#fff]">
                        <button
                            onClick={() => setShowOnboardModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="font-sans font-black text-4xl uppercase mb-8">New Recruit</h2>

                        <form onSubmit={handleCreateUser} className="space-y-6">
                            <BrutalInput
                                label="Phone (10 digits)"
                                placeholder="9876543210"
                                value={onboardForm.phone}
                                onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                                maxLength={10}
                            />
                            <BrutalInput
                                label="Full Name"
                                placeholder="John Doe"
                                value={onboardForm.name}
                                onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                            />
                            <div>
                                <label className="font-mono font-bold uppercase text-sm mb-2 block">Role Assignment</label>
                                <select
                                    value={onboardForm.role}
                                    onChange={(e) => setOnboardForm({ ...onboardForm, role: e.target.value as any })}
                                    className="w-full h-14 border-4 border-black px-4 font-mono font-bold uppercase"
                                >
                                    <option value="ADMIN">Administrator</option>
                                    <option value="DELIVERY_PARTNER">Delivery Partner</option>
                                </select>
                            </div>
                            <BrutalInput
                                label="City ID"
                                placeholder="1"
                                type="number"
                                value={onboardForm.default_city_id}
                                onChange={(e) => setOnboardForm({ ...onboardForm, default_city_id: parseInt(e.target.value) })}
                            />

                            <BrutalButton type="submit" className="w-full shadow-[6px_6px_0px_#000]">
                                CREATE USER
                            </BrutalButton>
                        </form>
                    </BrutalCard>
                </div>
            )}
        </div>
    );
}
