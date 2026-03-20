import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';
import type { User } from '../types';

export const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    memberships: [{
        id: 'membership-1',
        role: 'ADMIN',
        status: 'ACTIVE',
        joined_at: '2024-01-01T00:00:00Z',
        tenant: {
            id: 'tenant-1',
            name: 'Igreja Teste',
            slug: 'igreja-teste',
        },
    }],
};

export const defaultAuthValue: AuthContextValue = {
    user: mockUser,
    tenant: mockUser.memberships[0].tenant,
    membership: mockUser.memberships[0],
    isLoading: false,
    isAuthenticated: true,
    isTenantAdmin: true,
    hasPermission: () => true,
};

export const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
});

interface RenderWithProvidersOptions {
    initialRoute?: string;
    queryClient?: QueryClient;
    authValue?: AuthContextValue | null;
}

export function renderWithProviders(
    ui: ReactNode,
    {
        initialRoute = '/',
        queryClient = createTestQueryClient(),
        authValue = defaultAuthValue,
    }: RenderWithProvidersOptions = {},
) {
    window.history.pushState({}, 'Test page', initialRoute);

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[initialRoute]}>
                <AuthContext.Provider value={authValue}>
                    {ui}
                </AuthContext.Provider>
            </MemoryRouter>
        </QueryClientProvider>
    );
}

interface CreateWrapperOptions {
    initialRoute?: string;
    queryClient?: QueryClient;
    authValue?: AuthContextValue | null;
}

export function createWrapper({
    initialRoute = '/',
    queryClient = createTestQueryClient(),
    authValue = null,
}: CreateWrapperOptions = {}) {
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[initialRoute]}>
                <AuthContext.Provider value={authValue}>
                    {children}
                </AuthContext.Provider>
            </MemoryRouter>
        </QueryClientProvider>
    );
}
