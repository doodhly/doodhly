import { api } from "./api";
import { API_ENDPOINTS } from "./constants";

export interface Subscription {
    id: string;
    productName: string;
    quantity: number;
    frequency: "DAILY" | "ALTERNATE_DAYS";
    status: "ACTIVE" | "PAUSED" | "CANCELLED";
    nextDeliveryDate: string; // ISO Date
    pauseStartDate?: string;
    pauseEndDate?: string;
    pricePerUnit: number;
}

export const getSubscriptions = async (): Promise<Subscription[]> => {
    return api.get<Subscription[]>(API_ENDPOINTS.SUBSCRIPTIONS);
};

export const pauseSubscription = async (id: string, startDate: string, endDate?: string): Promise<void> => {
    // Backend expects { startDate, endDate }
    return api.patch(`${API_ENDPOINTS.SUBSCRIPTIONS}/${id}/pause`, { start_date: startDate, end_date: endDate });
};

export const resumeSubscription = async (id: string): Promise<void> => {
    return api.patch(`${API_ENDPOINTS.SUBSCRIPTIONS}/${id}/resume`, {});
};
