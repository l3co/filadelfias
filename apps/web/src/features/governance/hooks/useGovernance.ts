import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governanceService } from '../../../services/governance';
import type { CreateCouncilDTO } from '../../../services/governance';
import { toast } from 'sonner';

export const COUNCILS_KEY = 'councils';

export function useGovernance(tenantId: string | undefined) {
    return useQuery({
        queryKey: [COUNCILS_KEY, tenantId],
        queryFn: () => governanceService.listCouncils(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 60, // 1 hora
    });
}

export function useCreateCouncil(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCouncilDTO) => governanceService.createCouncil(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COUNCILS_KEY, tenantId] });
            toast.success('Órgão criado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao criar órgão.');
        }
    });
}
