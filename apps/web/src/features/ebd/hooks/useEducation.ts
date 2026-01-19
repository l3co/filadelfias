import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ebdService } from '../../../services/ebd';
import type { CreateClassDTO } from '../../../services/ebd';
import { toast } from 'sonner';

export const EBD_CLASSES_KEY = 'ebd-classes';

export function useEducation(tenantId: string | undefined) {
    return useQuery({
        queryKey: [EBD_CLASSES_KEY, tenantId],
        queryFn: () => ebdService.listClasses(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 10, // 10 min
    });
}

export function useCreateClass(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateClassDTO) => ebdService.createClass(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EBD_CLASSES_KEY] });
            toast.success('Classe EBD criada com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao criar classe. Tente novamente.');
        }
    });
}
