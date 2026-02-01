export const APP_NAME = "Doodhly";

export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    DASHBOARD: {
        CUSTOMER: "/app/dashboard",
        PARTNER: "/partner/route",
        ADMIN: "/admin/dashboard",
        SALES: "/sales/dashboard",
    },
};

export const API_ENDPOINTS = {
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    SUBSCRIPTIONS: "/customer/subscriptions",
    DELIVERY: "/delivery",
    DELIVERY_SYNC: "/delivery/sync",
};
