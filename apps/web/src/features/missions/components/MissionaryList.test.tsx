import { render, screen } from '@testing-library/react';
import { MissionaryList } from './MissionaryList';
import type { Missionary } from '../../../services/missions';

const mockMissionaries: Missionary[] = [
    {
        id: '1',
        name: 'Família Silva',
        field_name: 'Sertão Nordestino',
        country_code: 'BR',
        latitude: -10,
        longitude: -40,
        bio: 'Trabalho de plantação de igrejas.',
        tenant_id: 't1'
    },
    {
        id: '2',
        name: 'Project Africa',
        field_name: 'Maputo',
        country_code: 'MZ',
        latitude: -25,
        longitude: 32,
        tenant_id: 't1'
    }
];

describe('MissionaryList Component', () => {
    it('should render loading state', () => {
        const { container } = render(<MissionaryList isLoading={true} />);
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
    });

    it('should render empty state', () => {
        render(<MissionaryList missionaries={[]} />);
        expect(screen.getByText('Nenhum missionário')).toBeInTheDocument();
    });

    it('should render missionaries', () => {
        render(<MissionaryList missionaries={mockMissionaries} />);

        expect(screen.getByText('Família Silva')).toBeInTheDocument();
        expect(screen.getByText('Project Africa')).toBeInTheDocument();
        expect(screen.getByText('Sertão Nordestino')).toBeInTheDocument();
        expect(screen.getByText('BR')).toBeInTheDocument();
        expect(screen.getByText('MZ')).toBeInTheDocument();
    });
});
