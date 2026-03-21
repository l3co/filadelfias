import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from './button';

describe('Button accessibility', () => {
    it('has no accessibility violations in default state', async () => {
        const { container } = render(<Button type="button">Salvar</Button>);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations while loading', async () => {
        const { container, getByRole } = render(
            <Button type="button" isLoading>
                Enviando
            </Button>
        );

        expect(getByRole('button')).toHaveAttribute('aria-busy', 'true');

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
