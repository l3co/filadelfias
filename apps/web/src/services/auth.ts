import { api } from '../lib/api';
import type { User } from '../types';

export interface RegisterData {
    email: string;
    name: string;
    password: string;
}

export interface LoginData {
    username: string; // OAuth2 uses 'username' field
    password: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export const authService = {
    /**
     * Register a new user
     */
    register: async (data: RegisterData): Promise<User> => {
        const response = await api.post<User>('/auth/register', data);
        return response.data;
    },

    /**
     * Login with email and password
     */
    login: async (data: LoginData): Promise<TokenResponse> => {
        // OAuth2 expects form data, not JSON
        const formData = new URLSearchParams();
        formData.append('username', data.username);
        formData.append('password', data.password);

        const response = await api.post<TokenResponse>('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    /**
     * Get current user profile
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    /**
     * Change user password
     */
    changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
        const response = await api.put<{ message: string }>('/auth/me/password', null, {
            params: {
                current_password: currentPassword,
                new_password: newPassword,
            },
        });
        return response.data;
    },

    /**
     * Logout (clear local token)
     */
    logout: () => {
        localStorage.removeItem('access_token');
    },
};
