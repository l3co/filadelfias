import { render, screen } from '@testing-library/react';
import { MembersTable } from './MembersTable';
import type { Member } from '../../../types';

const mockMembers: Member[] = [
    {
        id: '1',
        full_name: 'João Silva',
        email: 'joao@email.com',
        role: 'MEMBRO',
        status: 'COMUNGANTE',
        gender: 'M',
        marital_status: 'CASADO',
        birth_date: '1990-01-01',
        phone: '123456789',
        tenant_id: 't1',
        office: 'MEMBRO',
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
    },
    {
        id: '2',
        full_name: 'Maria Santos',
        email: 'maria@email.com',
        role: 'DIACONO',
        status: 'NAO_COMUNGANTE',
        gender: 'F',
        marital_status: 'SOLTEIRA',
        birth_date: '1995-01-01',
        phone: '987654321',
        tenant_id: 't1',
        office: 'DIACONO',
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
    }
];

describe('MembersTable Component', () => {
    it('should render loading state', () => {
        render(<MembersTable isLoading={true} />);
        // Loading state uses skeleton animation
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render empty state when no members', () => {
        render(<MembersTable members={[]} />);
        expect(screen.getByText('Nenhum membro cadastrado')).toBeInTheDocument();
    });

    it('should render member list correctly', () => {
        render(<MembersTable members={mockMembers} />);

        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
        expect(screen.getByText('joao@email.com')).toBeInTheDocument();

        // Verificar Badges de Status (renderizados com getStatusLabel)
        expect(screen.getByText('Comungante')).toBeInTheDocument();
        expect(screen.getByText('Não Comungante')).toBeInTheDocument();

        // Verificar Badge de Cargo (apenas para cargos especiais)
        expect(screen.queryByText('MEMBRO')).not.toBeInTheDocument(); // Membro normal não tem badge extra
        expect(screen.getByText('Diácono')).toBeInTheDocument();
    });
});
