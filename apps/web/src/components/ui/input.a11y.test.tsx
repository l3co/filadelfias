import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Input } from './input';

describe('Input accessibility', () => {
    it('has no accessibility violations when associated with a label', async () => {
        const { container } = render(
            <div>
                <label htmlFor="member-search">Buscar membros</label>
                <Input id="member-search" type="text" />
            </div>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('marks error state with aria-invalid', () => {
        const { getByLabelText } = render(
            <div>
                <label htmlFor="member-email">E-mail</label>
                <Input id="member-email" type="email" error />
            </div>
        );

        expect(getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true');
    });
});
