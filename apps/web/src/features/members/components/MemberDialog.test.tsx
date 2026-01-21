import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemberDialog } from './MemberDialog';
import type { Member } from '../../../types';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockMember: Member = {
    id: '1',
    full_name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999999999',
    role: 'MEMBRO',
    status: 'ACTIVE',
    office: 'MEMBRO',
    tenant_id: 't1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
};

describe('MemberDialog Component', () => {
    beforeEach(() => {
        queryClient.clear();
    });

    it('should render create mode when no member provided', () => {
        render(
            <MemberDialog 
                isOpen={true} 
                onClose={() => {}} 
                tenantId="t1" 
            />,
            { wrapper }
        );

        expect(screen.getByText('Novo Membro')).toBeInTheDocument();
    });

    it('should render edit mode when member provided', () => {
        render(
            <MemberDialog 
                isOpen={true} 
                onClose={() => {}} 
                tenantId="t1"
                member={mockMember}
            />,
            { wrapper }
        );

        expect(screen.getByText('Editar Membro')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
        render(
            <MemberDialog 
                isOpen={false} 
                onClose={() => {}} 
                tenantId="t1" 
            />,
            { wrapper }
        );

        expect(screen.queryByText('Novo Membro')).not.toBeInTheDocument();
    });

    it('should show form fields', () => {
        render(
            <MemberDialog 
                isOpen={true} 
                onClose={() => {}} 
                tenantId="t1" 
            />,
            { wrapper }
        );

        expect(screen.getByPlaceholderText('Nome completo')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('email@exemplo.com')).toBeInTheDocument();
    });

    it('should populate form when editing', () => {
        render(
            <MemberDialog 
                isOpen={true} 
                onClose={() => {}} 
                tenantId="t1"
                member={mockMember}
            />,
            { wrapper }
        );

        const nameInput = screen.getByPlaceholderText('Nome completo') as HTMLInputElement;
        expect(nameInput.value).toBe('João Silva');
    });
});
