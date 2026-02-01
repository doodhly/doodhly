import { api } from "./api";
import { API_ENDPOINTS } from "./constants";

export interface DeliveryItem {
    id: string; // Subscription ID or Delivery Item ID
    productName: string;
    quantity: number;
    unit: string;
}

export interface RunSheetItem {
    id: string; // DailyDelivery ID
    customerId?: string;
    customerName: string;
    address: string;
    lat?: number;
    lng?: number;
    phone: string;
    productName: string;
    quantity: number;
    unit: string;
    sequence: number;
    status: "PENDING" | "DELIVERED" | "MISSED" | "ATTEMPTED" | "SKIPPED" | "OUT_FOR_DELIVERY";
    instructions?: string;
}

export interface SyncResponse {
    date: string;
    routeId: string;
    deliveries: RunSheetItem[];
}

// Fetch today's run sheet
export const syncRunSheet = async (): Promise<SyncResponse> => {
    const today = new Date().toISOString().split('T')[0];
    return api.get<SyncResponse>(`${API_ENDPOINTS.DELIVERY_SYNC}?date=${today}`);
};

// Actions
export const verifyDelivery = async (deliveryId: string, code: string): Promise<void> => {
    // Backend: router.post('/verify', ... { code })
    return api.post(`${API_ENDPOINTS.DELIVERY}/verify`, { code });
};

export const reportIssue = async (deliveryId: string, reason: string): Promise<void> => {
    // Backend: router.post('/report-issue', ... { daily_delivery_id, reason })
    return api.post(`${API_ENDPOINTS.DELIVERY}/report-issue`, {
        daily_delivery_id: deliveryId,
        reason
    });
};

// Calendar (Customer) - Keeping this from Sprint 1
export interface DailyDelivery {
    date: string;
    items: {
        productName: string;
        quantity: number;
        unit: string;
    }[];
    status: "PENDING" | "DELIVERED" | "SKIPPED" | "UNDELIVERED";
}

export const getMonthlyDeliveries = async (month: number, year: number): Promise<DailyDelivery[]> => {
    return api.get<DailyDelivery[]>(`${API_ENDPOINTS.DELIVERY}/calendar?month=${month}&year=${year}`);
};
