import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prayerService } from '../../../services/prayer';
import type { CreatePrayerRequestDTO } from '../../../services/prayer';
import { toast } from 'sonner';

export const PRAYER_KEY = 'prayer-requests';

export function usePrayerRequests(tenantId: string | undefined) {
    return useQuery({
        queryKey: [PRAYER_KEY, tenantId],
        queryFn: () => prayerService.listRequests(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useCreatePrayerRequest(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePrayerRequestDTO) => prayerService.createRequest(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PRAYER_KEY, tenantId] });
            toast.success('Pedido de oração compartilhado!');
        },
        onError: () => {
            toast.error('Erro ao compartilhar pedido.');
        }
    });
}

export function usePrayFor(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) => prayerService.prayFor(tenantId!, requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PRAYER_KEY, tenantId] });
        },
        onError: () => {
            toast.error('Erro ao registrar oração.');
        }
    });
}

export function useDeletePrayerRequest(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) => prayerService.deleteRequest(tenantId!, requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PRAYER_KEY, tenantId] });
            toast.success('Pedido removido.');
        },
        onError: () => {
            toast.error('Erro ao remover pedido.');
        }
    });
}
