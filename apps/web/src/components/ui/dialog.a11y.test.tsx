import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './dialog';
import { Button } from './button';

describe('Dialog accessibility', () => {
    it('has no accessibility violations when title and description are provided', async () => {
        const { container, getByRole } = render(
            <Dialog open>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar membro</DialogTitle>
                        <DialogDescription>Atualize as informações principais do membro.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline">Cancelar</Button>
                        <Button type="button">Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        expect(getByRole('button', { name: 'Fechar diálogo' })).toBeInTheDocument();

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
