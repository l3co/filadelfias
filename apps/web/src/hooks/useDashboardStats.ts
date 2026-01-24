import { useCurrentTenant } from './useAuth';
import { useMembers } from '../features/members/hooks/useMembers';
import { useFinancialData } from '../features/financial/hooks/useFinancial';

interface DashboardStats {
  members: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  financial: {
    balance: number;
    incomeThisMonth: number;
    expenseThisMonth: number;
  };
  isLoading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const tenant = useCurrentTenant();
  const tenantId = tenant?.id || '';

  const { data: members, isLoading: membersLoading } = useMembers(tenantId);
  const { accounts, transactions, isLoading: financialLoading } = useFinancialData(tenantId);

  // Calculate member stats
  const memberStats = {
    total: members?.length || 0,
    active: members?.filter(m => m.status === 'COMUNGANTE').length || 0,
    inactive: members?.filter(m => m.status === 'NAO_COMUNGANTE' || m.status === 'AFASTADO').length || 0,
    newThisMonth: calculateNewMembersThisMonth(members || []),
  };

  // Calculate financial stats
  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  const { income, expense } = calculateMonthlyTotals(transactions || []);

  return {
    members: memberStats,
    financial: {
      balance: totalBalance,
      incomeThisMonth: income,
      expenseThisMonth: expense,
    },
    isLoading: membersLoading || financialLoading,
  };
}

function calculateNewMembersThisMonth(members: { created_at?: string }[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return members.filter(m => {
    if (!m.created_at) return false;
    const createdAt = new Date(m.created_at);
    return createdAt >= startOfMonth;
  }).length;
}

function calculateMonthlyTotals(transactions: { date?: string; type?: string; amount?: number }[]): {
  income: number;
  expense: number;
} {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (!t.date) return;
    const txDate = new Date(t.date);
    if (txDate < startOfMonth) return;

    const amount = t.amount || 0;
    if (t.type === 'CREDIT') {
      income += amount;
    } else if (t.type === 'DEBIT') {
      expense += amount;
    }
  });

  return { income, expense };
}

// Hook for formatted currency values
export function useFormattedStats() {
  const stats = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return {
    ...stats,
    formatted: {
      balance: formatCurrency(stats.financial.balance),
      incomeThisMonth: formatCurrency(stats.financial.incomeThisMonth),
      expenseThisMonth: formatCurrency(stats.financial.expenseThisMonth),
    },
  };
}
