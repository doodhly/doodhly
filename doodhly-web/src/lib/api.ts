import { ROUTES } from "./constants";

const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const { hostname, search } = window.location;

        const urlParams = new URLSearchParams(search);

        // Manual Reset: ?clear_api=true
        if (urlParams.get('clear_api')) {
            localStorage.removeItem('API_URL_OVERRIDE');
            alert("API Override Cleared.");
            window.history.replaceState({}, '', window.location.pathname);
            return "";
        }

        const paramOverride = urlParams.get('api_url');
        if (paramOverride) {
            const cleanUrl = paramOverride.replace(/\/$/, "");
            localStorage.setItem('API_URL_OVERRIDE', cleanUrl);
            window.history.replaceState({}, '', window.location.pathname);
            return cleanUrl;
        }

        const override = localStorage.getItem('API_URL_OVERRIDE');
        if (override) return override;

        // If we are on a tunnel (ngrok), we use the /api_backend proxy
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return "/api_backend"; // Relative path to proxy
        }

        return `http://localhost:5000/api/v1`;
    }
    return "http://localhost:5000/api/v1";
};

const getFinalApiUrl = () => process.env.NEXT_PUBLIC_API_URL || getApiBaseUrl();

class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = "ApiError";
    }
}

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
    silent?: boolean;
}

async function fetchWrapper<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const baseUrl = getFinalApiUrl();

    // Improved Cache Buster (only in dev)
    let finalEndpoint = endpoint;
    if (process.env.NODE_ENV === 'development') {
        const mid = endpoint.includes('?') ? '&' : '?';
        finalEndpoint = `${endpoint}${mid}v=${Date.now()}`;
    }

    // Proxy Strategy: If baseUrl is relative (/api_backend), use it directly
    let url = "";
    if (baseUrl.startsWith('/')) {
        url = `${baseUrl}${finalEndpoint.startsWith('/') ? finalEndpoint : '/' + finalEndpoint}`;
    } else {
        const finalBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
        url = `${finalBaseUrl}${finalEndpoint.startsWith('/') ? finalEndpoint : '/' + finalEndpoint}`;
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        "bypass-tunnel-reminder": "true",
        "x-pinggy-no-interstitial": "true",
        ...options.headers,
    };

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const config: RequestInit = {
        ...options,
        headers,
        // Standardize on 'include' for tunnels in dev
        credentials: "include",
        signal: controller.signal
    };

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        if (response.status === 401) {
            if (!options.silent && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.href = ROUTES.LOGIN;
            }
            throw new ApiError("Unauthorized", 401);
        }

        if (response.status === 204) {
            return {} as T;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMessage = data.message || `API Error: ${response.statusText}`;
            throw new ApiError(errorMessage, response.status, data);
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        const msg = error instanceof Error ? error.message : "Network Error";
        if (process.env.NODE_ENV === 'development') {
            console.error(`🔍 API Fetch Error:`, { url, msg, error });
        }

        throw new ApiError(msg, 500);
    }
}

export const api = {
    get: <T>(endpoint: string, options?: FetchOptions) =>
        fetchWrapper<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, body: any, options?: FetchOptions) =>
        fetchWrapper<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),

    put: <T>(endpoint: string, body: any, options?: FetchOptions) =>
        fetchWrapper<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

    patch: <T>(endpoint: string, body: any, options?: FetchOptions) =>
        fetchWrapper<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),

    delete: <T>(endpoint: string, options?: FetchOptions) =>
        fetchWrapper<T>(endpoint, { ...options, method: "DELETE" }),
};
