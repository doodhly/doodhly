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
    SEND_OTP: "/auth/otp",
    VERIFY_OTP: "/auth/login",
    LOGOUT: "/auth/logout",
    SUBSCRIPTIONS: "/customer/subscriptions",
    DELIVERY: "/delivery",
    DELIVERY_SYNC: "/delivery/sync",
};
