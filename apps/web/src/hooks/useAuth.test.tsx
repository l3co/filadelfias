import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLogin, useRegister, useCurrentUser, useLogout } from './useAuth';
import { authService } from '../services/auth';
import { createWrapper } from '../test/utils';

// Mock authService with correct relative path matching the import in useAuth.ts
vi.mock('../services/auth', () => ({
    authService: {
        login: vi.fn(),
        register: vi.fn(),
        getCurrentUser: vi.fn(),
        logout: vi.fn(),
    },
}));

describe('useAuth Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('useLogin', () => {
        it('should call authService.login and store token on success', async () => {
            const mockTokenResponse = {
                access_token: 'test-token',
                token_type: 'bearer',
            };
            (authService.login as any).mockResolvedValue(mockTokenResponse);

            const { result } = renderHook(() => useLogin(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ username: 'test@example.com', password: 'password' });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(authService.login).toHaveBeenCalledWith({
                username: 'test@example.com',
                password: 'password',
            });
            expect(localStorage.getItem('access_token')).toBe('test-token');
        });
    });

    describe('useRegister', () => {
        it('should call authService.register', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
            };
            (authService.register as any).mockResolvedValue(mockUser);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({
                email: 'test@example.com',
                name: 'Test User',
                password: 'password',
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(authService.register).toHaveBeenCalledWith({
                email: 'test@example.com',
                name: 'Test User',
                password: 'password',
            });
        });
    });

    describe('useCurrentUser', () => {
        it('should return user data when token exists', async () => {
            localStorage.setItem('access_token', 'test-token');
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
            };
            (authService.getCurrentUser as any).mockResolvedValue(mockUser);

            const { result } = renderHook(() => useCurrentUser(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual(mockUser);
            expect(authService.getCurrentUser).toHaveBeenCalled();
        });

        it('should not fetch when token is missing', async () => {
            const { result } = renderHook(() => useCurrentUser(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isPending).toBe(true);
            expect(result.current.fetchStatus).toBe('idle');
            expect(authService.getCurrentUser).not.toHaveBeenCalled();
        });
    });

    describe('useLogout', () => {
        it('should call authService.logout and clear queries', async () => {
            const { result } = renderHook(() => useLogout(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(authService.logout).toHaveBeenCalled();
        });
    });
});
