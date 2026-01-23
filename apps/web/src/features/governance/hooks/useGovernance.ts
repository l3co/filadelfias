import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governanceService } from '../../../services/governance';
import type { CreateCouncilDTO, CreateMeetingDTO, UpdateMeetingDTO } from '../../../services/governance';
import { toast } from 'sonner';

export const COUNCILS_KEY = 'councils';
export const MEETINGS_KEY = 'meetings';

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

export function useDeleteCouncil(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (councilId: string) => governanceService.deleteCouncil(tenantId!, councilId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COUNCILS_KEY, tenantId] });
            toast.success('Órgão excluído com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao excluir órgão.');
        }
    });
}

export function useUpdateCouncil(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ councilId, data }: { councilId: string; data: Partial<CreateCouncilDTO> }) =>
            governanceService.updateCouncil(tenantId!, councilId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COUNCILS_KEY, tenantId] });
            toast.success('Órgão atualizado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao atualizar órgão.');
        }
    });
}

export function useAddCouncilMember(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ councilId, memberId }: { councilId: string; memberId: string }) =>
            governanceService.addMember(tenantId!, councilId, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COUNCILS_KEY, tenantId] });
            toast.success('Membro adicionado ao órgão!');
        },
        onError: () => {
            toast.error('Erro ao adicionar membro.');
        }
    });
}

export function useRemoveCouncilMember(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ councilId, memberId }: { councilId: string; memberId: string }) =>
            governanceService.removeMember(tenantId!, councilId, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COUNCILS_KEY, tenantId] });
            toast.success('Membro removido do órgão!');
        },
        onError: () => {
            toast.error('Erro ao remover membro.');
        }
    });
}

// ============================================
// Meeting Hooks
// ============================================

export function useMeetings(tenantId: string | undefined, councilId: string | undefined) {
    return useQuery({
        queryKey: [MEETINGS_KEY, tenantId, councilId],
        queryFn: () => governanceService.listMeetings(tenantId!, councilId!),
        enabled: !!tenantId && !!councilId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCreateMeeting(tenantId: string | undefined, councilId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Omit<CreateMeetingDTO, 'council_id'>) =>
            governanceService.createMeeting(tenantId!, { ...data, council_id: councilId! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MEETINGS_KEY, tenantId, councilId] });
            toast.success('Reunião agendada com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao agendar reunião.');
        }
    });
}

export function useUpdateMeeting(tenantId: string | undefined, councilId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ meetingId, data }: { meetingId: string; data: UpdateMeetingDTO }) =>
            governanceService.updateMeeting(tenantId!, meetingId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MEETINGS_KEY, tenantId, councilId] });
            toast.success('Reunião atualizada com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao atualizar reunião.');
        }
    });
}

export function useCompleteMeeting(tenantId: string | undefined, councilId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (meetingId: string) => governanceService.completeMeeting(tenantId!, meetingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MEETINGS_KEY, tenantId, councilId] });
            toast.success('Reunião finalizada com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao finalizar reunião.');
        }
    });
}
