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

    it('should filter categories based on transaction type (INCOME)', async () => {
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
        
        // Find and click the category combobox button (second "Selecione ou crie..." button)
        const comboboxButtons = screen.getAllByRole('button', { name: /selecione ou crie/i });
        const categoryButton = comboboxButtons[1]; // Second one is category
        fireEvent.click(categoryButton);
        
        // Now the dropdown should be open and show filtered categories
        await waitFor(() => {
            expect(screen.getByText('Dízimos')).toBeInTheDocument();
        });
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

        // Fill description
        fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Oferta Teste' } });
        
        // Fill amount
        fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '150.50' } });
        
        // Select account via combobox
        const comboboxButtons = screen.getAllByRole('button', { name: /selecione ou crie/i });
        fireEvent.click(comboboxButtons[0]); // First is account
        await waitFor(() => {
            expect(screen.getByText('Conta Principal')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Conta Principal'));
        
        // Select category via combobox
        fireEvent.click(comboboxButtons[1]); // Second is category
        await waitFor(() => {
            expect(screen.getByText('Dízimos')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Dízimos'));

        // Submit form
        const submitButton = screen.getByRole('button', { name: /salvar lançamento/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: 'Oferta Teste',
                    amount: 150.5,
                    account_id: '1',
                    category_id: 'c1',
                    type: 'CREDIT',
                }),
                expect.any(Function)
            );
        });
    });
});
