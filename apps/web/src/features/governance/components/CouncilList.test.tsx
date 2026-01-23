import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    const renderWithClient = (ui: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>
                {ui}
            </QueryClientProvider>
        );
    };

    it('should render loading state', () => {
        const { container } = renderWithClient(<CouncilList isLoading={true} />);
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
    });

    it('should render empty state', () => {
        renderWithClient(<CouncilList councils={[]} />);
        expect(screen.getByText('Nenhum órgão governamental')).toBeInTheDocument();
    });

    it('should render councils grouped by section', () => {
        renderWithClient(<CouncilList councils={mockCouncils} />);

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
