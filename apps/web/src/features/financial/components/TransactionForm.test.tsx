import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';
import { vi } from 'vitest';
import type { FinancialAccount, TransactionCategory } from '../../../services/financial';

const mockAccounts: FinancialAccount[] = [
    { id: '1', name: 'Conta Principal', type: 'BANK', balance: 1000, tenant_id: 't1' },
    { id: '2', name: 'Caixinha', type: 'CASH', balance: 50, tenant_id: 't1' }
];

const mockCategories: TransactionCategory[] = [
    { id: 'c1', name: 'Dízimos', type: 'INCOME', tenant_id: 't1' },
    { id: 'c2', name: 'Aluguel', type: 'EXPENSE', tenant_id: 't1' }
];

describe('TransactionForm Component', () => {
    const mockOnSubmit = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(
            <TransactionForm
                isOpen={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );
        expect(screen.queryByText('Nova Receita')).not.toBeInTheDocument();
    });

    it('should render correct title for CREDIT type', () => {
        render(
            <TransactionForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                initialType="CREDIT"
            />
        );
        expect(screen.getByText('Nova Receita')).toBeInTheDocument();
    });

    it('should filter categories based on transaction type (INCOME)', () => {
        render(
            <TransactionForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                initialType="CREDIT"
                categories={mockCategories}
                accounts={mockAccounts}
            />
        );
        expect(screen.getByText('Dízimos')).toBeInTheDocument();
        expect(screen.queryByText('Aluguel')).not.toBeInTheDocument();
    });

    it('should submit form data correctly', async () => {
        render(
            <TransactionForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                initialType="CREDIT"
                categories={mockCategories}
                accounts={mockAccounts}
            />
        );

        fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Oferta Teste' } });
        fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '150.50' } });
        fireEvent.change(screen.getByLabelText('Conta'), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'c1' } });

        const submitButton = screen.getByRole('button', { name: /salvar lançamento/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                description: 'Oferta Teste',
                amount: 150.5,
                account_id: '1',
                category_id: 'c1',
                type: 'CREDIT',
                date: expect.any(String)
            });
        });
    });
});
