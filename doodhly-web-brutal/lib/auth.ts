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

// Re-export types to avoid breaking changes


import { API_ENDPOINTS } from "./constants";

export const sendOtp = async (phone: string): Promise<void> => {
    return api.post(API_ENDPOINTS.SEND_OTP, { phone });
};

export const verifyOtp = async (phone: string, otp: string): Promise<{ user: User }> => {
    return api.post(API_ENDPOINTS.VERIFY_OTP, { phone, otp });
};

export const logout = async (): Promise<void> => {
    return api.post(API_ENDPOINTS.LOGOUT, {});
};

export const getUserSession = async (): Promise<User | null> => {
    try {
        return await api.get<User>("/auth/me", { silent: true });
    } catch (error) {
        console.warn("Session check failed", error);
        return null;
    }
};
