import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionService } from '../../../services/missions';
import type { CreateMissionaryDTO } from '../../../services/missions';
import { toast } from 'sonner';

export const MISSIONS_KEY = 'missionaries';

export function useMissions(tenantId: string | undefined) {
    return useQuery({
        queryKey: [MISSIONS_KEY, tenantId],
        queryFn: () => missionService.listMissionaries(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 60, // 1 hora
    });
}

export function useCreateMissionary(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMissionaryDTO) => missionService.createMissionary(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MISSIONS_KEY, tenantId] });
            toast.success('Missionário criado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao cadastrar missionário.');
        }
    });
}

export function useDeleteMissionary(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (missionaryId: string) => missionService.deleteMissionary(tenantId!, missionaryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MISSIONS_KEY, tenantId] });
            toast.success('Missionário excluído com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao excluir missionário.');
        }
    });
}
