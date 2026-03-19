import axios from 'axios';

// Runtime config type
interface RuntimeConfig {
    API_URL?: string;
}

declare global {
    interface Window {
        __CONFIG__?: RuntimeConfig;
    }
}

const isInvalidRuntimeUrl = (value: string): boolean => {
    return value === '__API_URL__' || value.includes('seu-dominio');
};

// Runtime config (injected by docker-entrypoint.sh) or build-time env or fallback
const getApiUrl = (): string => {
    // Check runtime config first (production)
    if (typeof window !== 'undefined' && window.__CONFIG__?.API_URL) {
        const runtimeUrl = window.__CONFIG__.API_URL;
        // Ignore placeholder or unfinished hostnames
        if (!isInvalidRuntimeUrl(runtimeUrl)) {
            return runtimeUrl;
        }
    }

    const buildTimeUrl = import.meta.env.VITE_API_URL;
    if (buildTimeUrl && !isInvalidRuntimeUrl(buildTimeUrl)) {
        return buildTimeUrl;
    }

    // Prefer same-origin proxy in production-like environments.
    return import.meta.env.DEV ? 'http://localhost:8000' : '/api';
};

const API_URL = getApiUrl();

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token on 401, but only redirect if NOT on login page
            // This allows login errors to be shown to the user
            localStorage.removeItem('access_token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
