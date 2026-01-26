import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/services/api';

interface User {
    id: string;
    email: string;
    name: string;
    memberships: Membership[];
}

interface Membership {
    id: string;
    tenant: Tenant;
    role: string;
    status: string;
}

interface Tenant {
    id: string;
    name: string;
    slug: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    getCurrentTenant: () => Tenant | null;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    login: async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        await SecureStore.setItemAsync('access_token', response.data.access_token);
        await get().checkAuth();
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('access_token');
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        try {
            set({ isLoading: true });
            const token = await SecureStore.getItemAsync('access_token');

            if (!token) {
                set({ user: null, isAuthenticated: false, isLoading: false });
                return;
            }

            const response = await api.get('/auth/me');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch {
            await SecureStore.deleteItemAsync('access_token');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    getCurrentTenant: () => {
        const user = get().user;
        return user?.memberships?.[0]?.tenant ?? null;
    },

    isAdmin: () => {
        const user = get().user;
        const role = user?.memberships?.[0]?.role;
        return role === 'ADMIN' || role === 'OWNER';
    },
}));
