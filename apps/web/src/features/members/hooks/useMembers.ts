import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService } from '../../../services/members';
import type { MemberCreateData } from '../../../types';
import { toast } from 'sonner';

export const MEMBERS_QUERY_KEY = 'members';

export function useMembers(tenantId: string | undefined) {
    return useQuery({
        queryKey: [MEMBERS_QUERY_KEY, tenantId],
        queryFn: () => membersService.listMembers(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

export function useCreateMember(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MemberCreateData) => membersService.createMember(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY, tenantId] });
            toast.success('Membro criado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao criar membro. Verifique os dados.');
        }
    });
}
