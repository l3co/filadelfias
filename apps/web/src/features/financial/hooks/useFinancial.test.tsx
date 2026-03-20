import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '../../../test/utils';
import { useFinancialData } from './useFinancial';
import { financialService } from '../../../services/financial';

vi.mock('../../../services/financial', async () => {
  const actual = await vi.importActual('../../../services/financial');

  return {
    ...actual,
    financialService: {
      listAccounts: vi.fn(),
      listCategories: vi.fn(),
      listTransactions: vi.fn(),
      createTransaction: vi.fn(),
      createAccount: vi.fn(),
      createCategory: vi.fn(),
    },
  };
});

const mockFinancialService = vi.mocked(financialService);

describe('useFinancialData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads accounts, categories and transactions and derives total balance', async () => {
    mockFinancialService.listAccounts.mockResolvedValue([
      { id: 'acc-1', name: 'Caixa', balance: 100 },
      { id: 'acc-2', name: 'Banco', balance: 250.5 },
    ] as never);
    mockFinancialService.listCategories.mockResolvedValue([
      { id: 'cat-1', name: 'Dízimo', type: 'INCOME' },
    ] as never);
    mockFinancialService.listTransactions.mockResolvedValue([
      { id: 'tx-1', description: 'Entrada', amount: 50, type: 'CREDIT', date: '2026-03-10T00:00:00Z' },
    ] as never);

    const { result } = renderHook(() => useFinancialData('tenant-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFinancialService.listAccounts).toHaveBeenCalledWith('tenant-1');
    expect(mockFinancialService.listCategories).toHaveBeenCalledWith('tenant-1');
    expect(mockFinancialService.listTransactions).toHaveBeenCalledWith('tenant-1', {
      month: 3,
      year: 2026,
      page: 1,
        pageSize: 10,
      });
    expect(result.current.totalBalance).toBe(350.5);
    expect(result.current.filters).toEqual({
      month: 3,
      year: 2026,
      page: 1,
      pageSize: 10,
    });
  });

  it('does not run fetchers when tenantId is undefined', () => {
    renderHook(() => useFinancialData(undefined), {
      wrapper: createWrapper(),
    });

    expect(mockFinancialService.listAccounts).not.toHaveBeenCalled();
    expect(mockFinancialService.listCategories).not.toHaveBeenCalled();
    expect(mockFinancialService.listTransactions).not.toHaveBeenCalled();
  });

  it('updates pagination and month/year filters', async () => {
    mockFinancialService.listAccounts.mockResolvedValue([] as never);
    mockFinancialService.listCategories.mockResolvedValue([] as never);
    mockFinancialService.listTransactions.mockResolvedValue([] as never);

    const { result } = renderHook(() => useFinancialData('tenant-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.nextPage();
    });
    expect(result.current.filters.page).toBe(2);

    act(() => {
      result.current.prevPage();
    });
    expect(result.current.filters.page).toBe(1);

    act(() => {
      result.current.prevPage();
    });
    expect(result.current.filters.page).toBe(1);

    act(() => {
      result.current.setMonth(5);
    });
    expect(result.current.filters.month).toBe(5);
    expect(result.current.filters.page).toBe(1);

    act(() => {
      result.current.setYear(2025);
    });
    expect(result.current.filters.year).toBe(2025);
    expect(result.current.filters.page).toBe(1);
  });

  it('invalidates relevant queries after successful mutations', async () => {
    mockFinancialService.listAccounts.mockResolvedValue([] as never);
    mockFinancialService.listCategories.mockResolvedValue([] as never);
    mockFinancialService.listTransactions.mockResolvedValue([] as never);
    mockFinancialService.createTransaction.mockResolvedValue({ id: 'tx-1' } as never);
    mockFinancialService.createAccount.mockResolvedValue({ id: 'acc-1' } as never);
    mockFinancialService.createCategory.mockResolvedValue({ id: 'cat-1' } as never);

    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useFinancialData('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createTransaction.mutateAsync({
        account_id: 'acc-1',
        category_id: 'cat-1',
        amount: 100,
        type: 'CREDIT',
        description: 'Oferta',
        date: '2026-03-19',
      });
    });

    await act(async () => {
      await result.current.createAccount.mutateAsync({
        name: 'Caixa',
        type: 'CASH',
        balance: 0,
      });
    });

    await act(async () => {
      await result.current.createCategory.mutateAsync({
        name: 'Evento',
        type: 'EXPENSE',
      });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['financial-transactions'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['financial-accounts'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['financial-categories'] });
  });
});
