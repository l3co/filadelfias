import { api } from '../lib/api';

export interface RegisterData {
    email: string;
    name: string;
    password: string;
}

export interface LoginData {
    username: string; // OAuth2 uses 'username' field
    password: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
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
     * Logout (clear local token)
     */
    logout: () => {
        localStorage.removeItem('access_token');
    },
};
