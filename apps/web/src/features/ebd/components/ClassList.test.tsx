import { render, screen } from '@testing-library/react';
import { ClassList } from './ClassList';
import type { EBDClass } from '../../../services/ebd';

const mockClasses: EBDClass[] = [
    {
        id: '1',
        name: 'Jovens',
        location: 'Sala 1',
        min_age: 18,
        max_age: 25,
        tenant_id: 't1'
    },
    {
        id: '2',
        name: 'Crianças',
        description: 'Classe para os pequeninos',
        tenant_id: 't1'
    }
];

describe('ClassList Component', () => {
    it('should render loading state', () => {
        // Quando isLoading é true, nosso componente renderiza placeholders animados.
        // Podemos verificar se não há texto "Nenhuma classe" e se existem elementos genéricos
        // Como é visual, o mais seguro é verificar que não renderiza o estado vazio.
        const { container } = render(<ClassList isLoading={true} />);
        expect(screen.queryByText('Nenhuma classe')).not.toBeInTheDocument();
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
    });

    it('should render empty state', () => {
        render(<ClassList classes={[]} />);
        expect(screen.getByText('Nenhuma classe')).toBeInTheDocument();
    });

    it('should render class cards', () => {
        render(<ClassList classes={mockClasses} />);
        expect(screen.getByText('Jovens')).toBeInTheDocument();
        expect(screen.getByText('Crianças')).toBeInTheDocument();
        expect(screen.getByText('Sala 1')).toBeInTheDocument();
        expect(screen.getByText('Classe para os pequeninos')).toBeInTheDocument();

        // Verifica se a idade é formatada
        expect(screen.getByText(/18 - 25 anos/)).toBeInTheDocument();
    });
});
