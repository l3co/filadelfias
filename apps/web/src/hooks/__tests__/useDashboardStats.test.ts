/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../contexts/AuthContext', () => ({
  useAuthTenant: vi.fn(),
}));

vi.mock('../../features/members/hooks/useMembers', () => ({
  useMembers: vi.fn(),
}));

vi.mock('../../features/financial/hooks/useFinancial', () => ({
  useFinancialData: vi.fn(),
}));

import { useAuthTenant } from '../../contexts/AuthContext';
import { useMembers } from '../../features/members/hooks/useMembers';
import { useFinancialData } from '../../features/financial/hooks/useFinancial';
import { useDashboardStats, useFormattedStats } from '../useDashboardStats';

const mockUseAuthTenant = vi.mocked(useAuthTenant);
const mockUseMembers = vi.mocked(useMembers);
const mockUseFinancialData = vi.mocked(useFinancialData);

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-19T12:00:00Z'));

    mockUseAuthTenant.mockReturnValue({
      id: 'tenant-1',
      name: 'Igreja Teste',
      slug: 'igreja-teste',
    });
  });

  it('calculates member and financial stats correctly', () => {
    mockUseMembers.mockReturnValue({
      data: [
        { id: '1', status: 'COMUNGANTE', created_at: '2026-03-02T00:00:00Z' },
        { id: '2', status: 'COMUNGANTE', created_at: '2026-03-12T00:00:00Z' },
        { id: '3', status: 'NAO_COMUNGANTE', created_at: '2026-02-25T00:00:00Z' },
        { id: '4', status: 'AFASTADO', created_at: '2025-12-20T00:00:00Z' },
      ],
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    mockUseFinancialData.mockReturnValue({
      accounts: [
        { id: 'acc-1', balance: 1500 },
        { id: 'acc-2', balance: 250.75 },
      ],
      transactions: [
        { id: 'tx-1', type: 'CREDIT', amount: 1000, date: '2026-03-05T00:00:00Z' },
        { id: 'tx-2', type: 'DEBIT', amount: 200, date: '2026-03-08T00:00:00Z' },
        { id: 'tx-3', type: 'CREDIT', amount: 500, date: '2026-02-15T00:00:00Z' },
      ],
      isLoading: false,
    } as ReturnType<typeof useFinancialData>);

    const result = useDashboardStats();

    expect(mockUseMembers).toHaveBeenCalledWith('tenant-1');
    expect(mockUseFinancialData).toHaveBeenCalledWith('tenant-1');
    expect(result).toEqual({
      members: {
        total: 4,
        active: 2,
        inactive: 2,
        newThisMonth: 2,
      },
      financial: {
        balance: 1750.75,
        incomeThisMonth: 1000,
        expenseThisMonth: 200,
      },
      isLoading: false,
    });
  });

  it('returns zeroed stats when hooks have no data', () => {
    mockUseMembers.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    mockUseFinancialData.mockReturnValue({
      accounts: undefined,
      transactions: undefined,
      isLoading: false,
    } as ReturnType<typeof useFinancialData>);

    const result = useDashboardStats();

    expect(result).toEqual({
      members: {
        total: 0,
        active: 0,
        inactive: 0,
        newThisMonth: 0,
      },
      financial: {
        balance: 0,
        incomeThisMonth: 0,
        expenseThisMonth: 0,
      },
      isLoading: false,
    });
  });

  it('combines loading state from members and financial hooks', () => {
    mockUseMembers.mockReturnValue({
      data: [],
      isLoading: true,
    } as ReturnType<typeof useMembers>);

    mockUseFinancialData.mockReturnValue({
      accounts: [],
      transactions: [],
      isLoading: false,
    } as ReturnType<typeof useFinancialData>);

    expect(useDashboardStats().isLoading).toBe(true);

    mockUseMembers.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    mockUseFinancialData.mockReturnValue({
      accounts: [],
      transactions: [],
      isLoading: true,
    } as ReturnType<typeof useFinancialData>);

    expect(useDashboardStats().isLoading).toBe(true);
  });

  it('formats financial totals for presentation', () => {
    mockUseMembers.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    mockUseFinancialData.mockReturnValue({
      accounts: [{ id: 'acc-1', balance: 1234.56 }],
      transactions: [
        { id: 'tx-1', type: 'CREDIT', amount: 789.1, date: '2026-03-10T00:00:00Z' },
        { id: 'tx-2', type: 'DEBIT', amount: 45.67, date: '2026-03-11T00:00:00Z' },
      ],
      isLoading: false,
    } as ReturnType<typeof useFinancialData>);

    expect(useFormattedStats().formatted).toEqual({
      balance: 'R$ 1.234,56',
      incomeThisMonth: 'R$ 789,10',
      expenseThisMonth: 'R$ 45,67',
    });
  });
});
