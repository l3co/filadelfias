import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '../../../test/utils';
import { useExpenseMutations, useMyExpenses, usePendingExpenses } from './useExpense';
import { expenseService } from '../../../services/expense';
import { toast } from 'sonner';

vi.mock('../../../services/expense', async () => {
  const actual = await vi.importActual('../../../services/expense');

  return {
    ...actual,
    expenseService: {
      submitExpense: vi.fn(),
      getMyExpenses: vi.fn(),
      getPendingExpenses: vi.fn(),
      approveExpense: vi.fn(),
      deleteExpense: vi.fn(),
    },
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockExpenseService = vi.mocked(expenseService);
const mockToast = vi.mocked(toast);

describe('useExpense hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches my and pending expenses when tenantId exists', async () => {
    mockExpenseService.getMyExpenses.mockResolvedValue([{ id: 'expense-1', amount: 100 }] as never);
    mockExpenseService.getPendingExpenses.mockResolvedValue([{ id: 'expense-2', amount: 50 }] as never);

    const { result: myExpensesResult } = renderHook(() => useMyExpenses('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: pendingExpensesResult } = renderHook(() => usePendingExpenses('tenant-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(myExpensesResult.current.isSuccess).toBe(true);
      expect(pendingExpensesResult.current.isSuccess).toBe(true);
    });

    expect(mockExpenseService.getMyExpenses).toHaveBeenCalledWith('tenant-1');
    expect(mockExpenseService.getPendingExpenses).toHaveBeenCalledWith('tenant-1');
  });

  it('does not fetch expenses when tenantId is missing', () => {
    renderHook(() => useMyExpenses(undefined), {
      wrapper: createWrapper(),
    });
    renderHook(() => usePendingExpenses(undefined), {
      wrapper: createWrapper(),
    });

    expect(mockExpenseService.getMyExpenses).not.toHaveBeenCalled();
    expect(mockExpenseService.getPendingExpenses).not.toHaveBeenCalled();
  });

  it('invalidates expense and transaction queries and shows success toasts', async () => {
    mockExpenseService.submitExpense.mockResolvedValue({ id: 'expense-1' } as never);
    mockExpenseService.approveExpense.mockResolvedValue({ id: 'expense-1', status: 'APPROVED' } as never);
    mockExpenseService.deleteExpense.mockResolvedValue(undefined as never);

    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useExpenseMutations('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.submitExpense.mutate({
      amount: 100,
      category: 'MATERIAL',
      description: 'Compra',
      expense_date: '2026-03-19',
    });
    result.current.approveExpense.mutate({
      recordId: 'expense-1',
      data: { status: 'APPROVED' },
    });
    result.current.deleteExpense.mutate('expense-1');

    await waitFor(() => {
      expect(result.current.submitExpense.isSuccess).toBe(true);
      expect(result.current.approveExpense.isSuccess).toBe(true);
      expect(result.current.deleteExpense.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['expenses'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
    expect(mockToast.success).toHaveBeenCalledWith('Solicitação de reembolso enviada com sucesso!');
    expect(mockToast.success).toHaveBeenCalledWith('Solicitação aprovada com sucesso!');
    expect(mockToast.success).toHaveBeenCalledWith('Solicitação excluída com sucesso!');
  });

  it('shows error toasts for failed mutations', async () => {
    mockExpenseService.submitExpense.mockRejectedValue(new Error('submit failed'));
    mockExpenseService.approveExpense.mockRejectedValue(new Error('approve failed'));
    mockExpenseService.deleteExpense.mockRejectedValue(new Error('delete failed'));

    const { result } = renderHook(() => useExpenseMutations('tenant-1'), {
      wrapper: createWrapper(),
    });

    result.current.submitExpense.mutate({
      amount: 100,
      category: 'MATERIAL',
      description: 'Compra',
      expense_date: '2026-03-19',
    });
    result.current.approveExpense.mutate({
      recordId: 'expense-1',
      data: { status: 'REJECTED', rejection_reason: 'Sem comprovante' },
    });
    result.current.deleteExpense.mutate('expense-1');

    await waitFor(() => {
      expect(result.current.submitExpense.isError).toBe(true);
      expect(result.current.approveExpense.isError).toBe(true);
      expect(result.current.deleteExpense.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Erro ao enviar solicitação: submit failed');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao processar solicitação: approve failed');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao excluir solicitação: delete failed');
  });
});
