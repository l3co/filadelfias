import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth';
import type { RegisterData, LoginData } from '../services/auth';

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
        onSuccess: (response) => {
            localStorage.setItem('access_token', response.access_token);
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
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

    return useMutation({
        mutationFn: () => {
            authService.logout();
            return Promise.resolve();
        },
        onSuccess: () => {
            queryClient.clear();
        },
    });
};

export function useCurrentTenant() {
    const { data: user } = useCurrentUser();
    // For MVP, return the first tenant from memberships
    return user?.memberships?.[0]?.tenant;
}
