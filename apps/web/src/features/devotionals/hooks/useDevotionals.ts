import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devotionalService } from '../../../services/devotionals';
import type { CreateDevotionalDTO, UpdateDevotionalDTO } from '../../../services/devotionals';
import { toast } from 'sonner';

export const DEVOTIONALS_KEY = 'devotionals';

export function useDevotionals(tenantId: string | undefined, limit: number = 30) {
    return useQuery({
        queryKey: [DEVOTIONALS_KEY, tenantId, limit],
        queryFn: () => devotionalService.list(tenantId!, limit),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useTodayDevotional(tenantId: string | undefined) {
    return useQuery({
        queryKey: [DEVOTIONALS_KEY, 'today', tenantId],
        queryFn: () => devotionalService.getToday(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useDevotionalByDate(tenantId: string | undefined, date: string | undefined) {
    return useQuery({
        queryKey: [DEVOTIONALS_KEY, 'date', tenantId, date],
        queryFn: () => devotionalService.getByDate(tenantId!, date!),
        enabled: !!tenantId && !!date,
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateDevotional(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDevotionalDTO) => devotionalService.create(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [DEVOTIONALS_KEY] });
            toast.success('Devocional criado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao criar devocional.');
        }
    });
}

export function useUpdateDevotional(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDevotionalDTO }) => 
            devotionalService.update(tenantId!, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [DEVOTIONALS_KEY] });
            toast.success('Devocional atualizado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao atualizar devocional.');
        }
    });
}

export function useDeleteDevotional(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => devotionalService.delete(tenantId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [DEVOTIONALS_KEY] });
            toast.success('Devocional excluído com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao excluir devocional.');
        }
    });
}
