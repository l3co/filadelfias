import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService, type CreateTransactionDTO, type CreateAccountDTO } from '../../../services/financial';

interface TransactionFilters {
    month: number;
    year: number;
    page: number;
    pageSize: number;
}

export function useFinancialData(tenantId?: string) {
    const queryClient = useQueryClient();
    const now = new Date();
    
    const [filters, setFilters] = useState<TransactionFilters>({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        page: 1,
        pageSize: 10,
    });

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
        queryKey: ['financial-transactions', tenantId, filters],
        queryFn: () => financialService.listTransactions(tenantId!, filters),
        enabled: !!tenantId,
    });

    const createTransaction = useMutation({
        mutationFn: (data: CreateTransactionDTO) => financialService.createTransaction(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
        },
    });

    const createAccount = useMutation({
        mutationFn: (data: CreateAccountDTO) => financialService.createAccount(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
        },
    });

    const createCategory = useMutation({
        mutationFn: (data: { name: string; type: string }) => financialService.createCategory(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financial-categories'] });
        },
    });

    // Derived State (Regra de Negócio de Visualização)
    const totalBalance = accountsQuery.data?.reduce((acc, curr) => acc + curr.balance, 0) || 0;

    const nextPage = () => setFilters(f => ({ ...f, page: f.page + 1 }));
    const prevPage = () => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }));
    const setMonth = (month: number) => setFilters(f => ({ ...f, month, page: 1 }));
    const setYear = (year: number) => setFilters(f => ({ ...f, year, page: 1 }));

    return {
        accounts: accountsQuery.data,
        categories: categoriesQuery.data,
        transactions: transactionsQuery.data,
        isLoading: accountsQuery.isLoading || transactionsQuery.isLoading,
        createTransaction,
        createAccount,
        createCategory,
        totalBalance,
        filters,
        nextPage,
        prevPage,
        setMonth,
        setYear,
    };
}
