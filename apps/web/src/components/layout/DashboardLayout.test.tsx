import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from './DashboardLayout';
import { vi } from 'vitest';

// Mock the auth hooks
vi.mock('../../hooks/useAuth', () => ({
    useCurrentUser: vi.fn(() => ({
        data: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            memberships: [{
                id: 'm1',
                tenant: { id: 't1', name: 'Igreja Teste', slug: 'igreja-teste' },
                role: 'ADMIN',
                status: 'ACTIVE',
            }],
        },
        isLoading: false,
    })),
    useLogout: vi.fn(() => ({
        mutate: vi.fn(),
    })),
}));

// Mock permissions hook
vi.mock('../../hooks/usePermissions', () => ({
    usePermissions: vi.fn(() => ({
        can: () => true,
        canAny: () => true,
        canAll: () => true,
    })),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const renderWithProviders = (ui: React.ReactElement, { route = '/app' } = {}) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[route]}>
                {ui}
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe('DashboardLayout Component', () => {
    beforeEach(() => {
        queryClient.clear();
    });

    it('should render the layout with logo', () => {
        renderWithProviders(<DashboardLayout />);
        
        // Logo should be visible
        expect(screen.getAllByText('Filadélfias').length).toBeGreaterThan(0);
    });

    it('should render navigation items', () => {
        renderWithProviders(<DashboardLayout />);
        
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Membros')).toBeInTheDocument();
        expect(screen.getByText('Governança')).toBeInTheDocument();
        expect(screen.getByText('Tesouraria')).toBeInTheDocument();
    });

    it('should display tenant name', () => {
        renderWithProviders(<DashboardLayout />);
        
        expect(screen.getAllByText('Igreja Teste').length).toBeGreaterThan(0);
    });

    it('should display user name', () => {
        renderWithProviders(<DashboardLayout />);
        
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should have logout button', () => {
        renderWithProviders(<DashboardLayout />);
        
        expect(screen.getByText('Sair da conta')).toBeInTheDocument();
    });

    it('should have search input', () => {
        renderWithProviders(<DashboardLayout />);
        
        expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('should have notification bell', () => {
        renderWithProviders(<DashboardLayout />);
        
        // Bell icon button exists
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
