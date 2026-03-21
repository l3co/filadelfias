import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SearchAndFilter } from './SearchAndFilter';

describe('SearchAndFilter accessibility', () => {
    it('has no accessibility violations with labeled search and filters', async () => {
        const { container } = render(
            <SearchAndFilter
                searchValue=""
                onSearchChange={() => {}}
                onClearSearch={() => {}}
                searchPlaceholder="Buscar missionários"
                filters={[
                    { key: null, label: 'Todos', count: 4 },
                    { key: 'active', label: 'Ativos', count: 2 },
                ]}
                activeFilter={null}
                onFilterChange={() => {}}
            />
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
