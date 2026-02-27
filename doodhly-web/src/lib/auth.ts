import { api } from "./api";
// Define types locally since they were missing
export type UserRole = 'CUSTOMER' | 'DELIVERY_PARTNER' | 'ADMIN';

export interface User {
    id: string;
    phone: string;
    role: UserRole;
    default_city_id?: string;
    name?: string;
    referral_code?: string;
    streak_count?: number;
    current_tier?: string;
}

export const getUserSession = async (): Promise<User | null> => {
    try {
        return await api.get<User>("/auth/me", { silent: true });
    } catch (error) {
        console.warn("Session check failed", error);
        return null;
    }
};
