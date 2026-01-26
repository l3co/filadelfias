import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { titheService, type CreateTitheRecordDTO, type ApproveTitheDTO } from '../../../services/tithe';

export function useMyTitheRecords(tenantId?: string, year?: number) {
    return useQuery({
        queryKey: ['tithe-records-me', tenantId, year],
        queryFn: () => titheService.getMyRecords(tenantId!, year),
        enabled: !!tenantId,
    });
}

export function useMyTitheSummary(tenantId?: string, year?: number) {
    return useQuery({
        queryKey: ['tithe-summary-me', tenantId, year],
        queryFn: () => titheService.getMySummary(tenantId!, year),
        enabled: !!tenantId,
    });
}

export function usePendingTitheRecords(tenantId?: string) {
    return useQuery({
        queryKey: ['tithe-records-pending', tenantId],
        queryFn: () => titheService.getPendingRecords(tenantId!),
        enabled: !!tenantId,
    });
}

export function useAllTitheRecords(tenantId?: string, year?: number) {
    return useQuery({
        queryKey: ['tithe-records-all', tenantId, year],
        queryFn: () => titheService.getAllRecords(tenantId!, year),
        enabled: !!tenantId,
    });
}

export function useTitheMutations(tenantId?: string) {
    const queryClient = useQueryClient();

    const submitRecord = useMutation({
        mutationFn: (data: CreateTitheRecordDTO) => titheService.submitRecord(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tithe-records-me'] });
            queryClient.invalidateQueries({ queryKey: ['tithe-summary-me'] });
        },
    });

    const deleteRecord = useMutation({
        mutationFn: (recordId: string) => titheService.deleteMyRecord(tenantId!, recordId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tithe-records-me'] });
            queryClient.invalidateQueries({ queryKey: ['tithe-summary-me'] });
        },
    });

    const approveRecord = useMutation({
        mutationFn: ({ recordId, data }: { recordId: string; data: ApproveTitheDTO }) =>
            titheService.approveRecord(tenantId!, recordId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tithe-records-pending'] });
            queryClient.invalidateQueries({ queryKey: ['tithe-records-all'] });
            queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
        },
    });

    return {
        submitRecord,
        deleteRecord,
        approveRecord,
    };
}
