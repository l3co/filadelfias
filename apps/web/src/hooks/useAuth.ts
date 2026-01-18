import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, RegisterData, LoginData } from '../services/auth';

/**
 * Hook for user registration
 */
export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterData) => authService.register(data),
    });
};

/**
 * Hook for user login
 */
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginData) => authService.login(data),
        onSuccess: (response) => {
            // Store token in localStorage
            localStorage.setItem('access_token', response.access_token);

            // Invalidate user query to refetch
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
    });
};

/**
 * Hook to get current authenticated user
 */
export const useCurrentUser = () => {
    const token = localStorage.getItem('access_token');

    return useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: !!token, // Only fetch if token exists
        retry: false,
    });
};

/**
 * Hook for logout
 */
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            authService.logout();
            return Promise.resolve();
        },
        onSuccess: () => {
            // Clear all queries
            queryClient.clear();
        },
    });
};
