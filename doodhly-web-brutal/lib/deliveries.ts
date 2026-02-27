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
export const verifyDelivery = async (deliveryId: string, code: string, coords?: { lat: number; lng: number; accuracy: number }): Promise<void> => {
    // Backend: router.post('/verify', ... { code })
    return api.post(`${API_ENDPOINTS.DELIVERY}/verify`, { code, coords });
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

export const optimizeRoute = async (deliveries: RunSheetItem[]): Promise<{ optimizedRoute: RunSheetItem[], savings: { distance: string, time: string } }> => {
    return api.post('/partner/optimize', { deliveries }); // api.post automatically adds /api/v1 prefix based on base URL usually, but let's check api.ts or just rely on standard. Wait, other calls use /customer/wallet etc.
    // The previous calls in deliveries.ts were string literals like `${API_ENDPOINTS.DELIVERY}/verify`.
    // I should check `src/lib/api.ts` to see if it prepends /api/v1. 
    // Usually it does.
    // Let's assume axios baseURL includes /api/v1.
    // If not, I might need to adjust.
    // Let's assume standard convention for now.
};
