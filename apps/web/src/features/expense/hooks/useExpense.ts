import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '../../../services/expense';
import type { CreateExpenseRequest, ApproveExpenseRequest } from '../../../services/expense';
import { toast } from 'sonner';

export function useMyExpenses(tenantId?: string) {
    return useQuery({
        queryKey: ['expenses', 'my', tenantId],
        queryFn: () => expenseService.getMyExpenses(tenantId!),
        enabled: !!tenantId,
    });
}

export function usePendingExpenses(tenantId?: string) {
    return useQuery({
        queryKey: ['expenses', 'pending', tenantId],
        queryFn: () => expenseService.getPendingExpenses(tenantId!),
        enabled: !!tenantId,
    });
}

export function useExpenseMutations(tenantId?: string) {
    const queryClient = useQueryClient();

    const submitExpense = useMutation({
        mutationFn: (data: CreateExpenseRequest) => expenseService.submitExpense(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Solicitação de reembolso enviada com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao enviar solicitação: ${error.message}`);
        },
    });

    const approveExpense = useMutation({
        mutationFn: ({ recordId, data }: { recordId: string; data: ApproveExpenseRequest }) =>
            expenseService.approveExpense(tenantId!, recordId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            const action = variables.data.status === 'APPROVED' ? 'aprovada' : 'rejeitada';
            toast.success(`Solicitação ${action} com sucesso!`);
        },
        onError: (error: Error) => {
            toast.error(`Erro ao processar solicitação: ${error.message}`);
        },
    });

    const deleteExpense = useMutation({
        mutationFn: (recordId: string) => expenseService.deleteExpense(tenantId!, recordId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Solicitação excluída com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao excluir solicitação: ${error.message}`);
        },
    });

    return { submitExpense, approveExpense, deleteExpense };
}
