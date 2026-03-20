import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import type { RegisterData, LoginData } from '../services/auth';
import { ROUTES } from '../lib/routes';

const USER_QUERY_KEY = ['currentUser'];

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterData) => authService.register(data),
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginData) => authService.login(data),
        onSuccess: async (response) => {
            localStorage.setItem('access_token', response.access_token);
            await queryClient.fetchQuery({
                queryKey: USER_QUERY_KEY,
                queryFn: authService.getCurrentUser,
            });
        },
    });
};

export const useCurrentUser = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    return useQuery({
        queryKey: USER_QUERY_KEY,
        queryFn: authService.getCurrentUser,
        enabled: !!token,
        retry: false,
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: () => {
            authService.logout();
            return Promise.resolve();
        },
        onSuccess: () => {
            queryClient.clear();
            navigate(ROUTES.AUTH.LOGIN, { replace: true });
        },
    });
};
