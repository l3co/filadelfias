import axios from 'axios';

// Runtime config (injected by docker-entrypoint.sh) or build-time env or fallback
const getApiUrl = (): string => {
    // Check runtime config first (production)
    if (typeof window !== 'undefined' && (window as any).__CONFIG__?.API_URL) {
        const runtimeUrl = (window as any).__CONFIG__.API_URL;
        // Ignore placeholder value
        if (runtimeUrl !== '__API_URL__') {
            return runtimeUrl;
        }
    }
    // Fall back to build-time env or default
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
            // Clear token and redirect to login
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
