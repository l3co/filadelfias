import { render, screen } from '@testing-library/react';
import { CouncilList } from './CouncilList';
import type { Council } from '../../../services/governance';

const mockCouncils: Council[] = [
    {
        id: '1',
        name: 'Conselho da Igreja',
        type: 'SESSION',
        description: 'Reunião dos presbíteros',
        tenant_id: 't1'
    },
    {
        id: '2',
        name: 'Assembleia Ordinária',
        type: 'ASSEMBLY',
        tenant_id: 't1'
    }
];

describe('CouncilList Component', () => {
    it('should render loading state', () => {
        render(<CouncilList isLoading={true} />);
        expect(screen.getByText('Carregando governança...')).toBeInTheDocument();
    });

    it('should render empty state', () => {
        render(<CouncilList councils={[]} />);
        expect(screen.getByText('Nenhum órgão governamental')).toBeInTheDocument();
    });

    it('should render councils grouped by section', () => {
        render(<CouncilList councils={mockCouncils} />);

        // Verifica se os nomes dos conselhos estão presentes
        expect(screen.getByText('Conselho da Igreja')).toBeInTheDocument();
        expect(screen.getByText('Assembleia Ordinária')).toBeInTheDocument();

        // Verifica se os cabeçalhos das seções estão presentes e visíveis
        expect(screen.getByText('Conselhos e Juntas')).toBeInTheDocument();
        expect(screen.getByText('Assembleias')).toBeInTheDocument();

        // Verifica descrição
        expect(screen.getByText('Reunião dos presbíteros')).toBeInTheDocument();
    });
});
