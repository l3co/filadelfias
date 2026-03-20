import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionService } from '../../../services/missions';
import type {
  CreateCountryDTO,
  CreateMissionaryDTO,
  CreateSocialProjectDTO,
  UpdateMissionaryDTO,
} from '../../../services/missions';
import { toast } from 'sonner';

export const MISSIONS_KEY = 'missionaries';
export const COUNTRIES_KEY = 'countries';
export const SOCIAL_PROJECTS_KEY = 'social-projects';

// ============================================================================
// COUNTRIES
// ============================================================================

export function useCountries(tenantId: string | undefined) {
    return useQuery({
        queryKey: [COUNTRIES_KEY, tenantId],
        queryFn: () => missionService.listCountries(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 60, // 1 hora
    });
}

export function useCreateCountry(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCountryDTO) => missionService.createCountry(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [COUNTRIES_KEY, tenantId] });
        },
        onError: () => {
            toast.error('Erro ao cadastrar país.');
        }
    });
}

// ============================================================================
// MISSIONARIES
// ============================================================================

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

export function useUpdateMissionary(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ missionaryId, data }: { missionaryId: string; data: UpdateMissionaryDTO }) =>
            missionService.updateMissionary(tenantId!, missionaryId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MISSIONS_KEY, tenantId] });
            toast.success('Missionário atualizado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao atualizar missionário.');
        }
    });
}

export function useSocialProjects(tenantId: string | undefined) {
    return useQuery({
        queryKey: [SOCIAL_PROJECTS_KEY, tenantId],
        queryFn: () => missionService.listSocialProjects(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 10,
    });
}

export function useCreateSocialProject(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSocialProjectDTO) => missionService.createSocialProject(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SOCIAL_PROJECTS_KEY, tenantId] });
            toast.success('Projeto social criado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao criar projeto social.');
        }
    });
}

export function useDeleteSocialProject(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId: string) => missionService.deleteSocialProject(tenantId!, projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SOCIAL_PROJECTS_KEY, tenantId] });
            toast.success('Projeto social removido com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao remover projeto social.');
        }
    });
}
