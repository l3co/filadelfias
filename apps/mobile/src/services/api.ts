import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '@/constants/config';

export const api = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - adiciona token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - trata 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('access_token');
            // Navegar para login será tratado pelo authStore
        }
        return Promise.reject(error);
    }
);
