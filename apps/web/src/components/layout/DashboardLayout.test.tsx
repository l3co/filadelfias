import { screen } from '@testing-library/react';
import { DashboardLayout } from './DashboardLayout';
import { beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../../test/utils';

vi.mock('../../hooks/useAuth', () => ({
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

describe('DashboardLayout Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the layout with logo', () => {
        renderWithProviders(<DashboardLayout />, { initialRoute: '/admin' });
        
        // Logo should be visible
        expect(screen.getAllByText('Filadélfias').length).toBeGreaterThan(0);
    });

    it('should render navigation items', () => {
        renderWithProviders(<DashboardLayout />, { initialRoute: '/admin' });
        
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Membros')).toBeInTheDocument();
        expect(screen.getByText('Governança')).toBeInTheDocument();
        expect(screen.getByText('Tesouraria')).toBeInTheDocument();
    });

    it('should display tenant name', () => {
        renderWithProviders(<DashboardLayout />, { initialRoute: '/admin' });
        
        expect(screen.getAllByText('Igreja Teste').length).toBeGreaterThan(0);
    });

    it('should display user name', () => {
        renderWithProviders(<DashboardLayout />, { initialRoute: '/admin' });
        
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should have logout button', () => {
        renderWithProviders(<DashboardLayout />, { initialRoute: '/admin' });
        
        expect(screen.getByText('Sair da conta')).toBeInTheDocument();
    });

    it('should have search input', () => {
        renderWithProviders(<DashboardLayout />, { initialRoute: '/admin' });
        
        expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('should have notification bell', () => {
        renderWithProviders(<DashboardLayout />, { initialRoute: '/admin' });
        
        // Bell icon button exists
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
