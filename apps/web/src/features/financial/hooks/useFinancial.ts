import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService, type CreateTransactionDTO } from '../../../services/financial';

export function useFinancialData(tenantId?: string) {
    const queryClient = useQueryClient();

    const accountsQuery = useQuery({
        queryKey: ['financial-accounts', tenantId],
        queryFn: () => financialService.listAccounts(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60, // 1 minuto
    });

    const categoriesQuery = useQuery({
        queryKey: ['financial-categories', tenantId],
        queryFn: () => financialService.listCategories(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5, // 5 minutos (muda pouco)
    });

    const transactionsQuery = useQuery({
        queryKey: ['financial-transactions', tenantId],
        queryFn: () => financialService.listTransactions(tenantId!),
        enabled: !!tenantId,
    });

    const createTransaction = useMutation({
        mutationFn: (data: CreateTransactionDTO) => financialService.createTransaction(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
        },
    });

    // Derived State (Regra de Negócio de Visualização)
    const totalBalance = accountsQuery.data?.reduce((acc, curr) => acc + curr.balance, 0) || 0;

    return {
        accounts: accountsQuery.data,
        categories: categoriesQuery.data,
        transactions: transactionsQuery.data,
        isLoading: accountsQuery.isLoading || transactionsQuery.isLoading,
        createTransaction,
        totalBalance,
    };
}
