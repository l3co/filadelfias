import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '../../../test/utils';
import {
  COUNCILS_KEY,
  MEETINGS_KEY,
  useAddCouncilMember,
  useCompleteMeeting,
  useCreateCouncil,
  useCreateMeeting,
  useDeleteCouncil,
  useGovernance,
  useMeetings,
  useRemoveCouncilMember,
  useUpdateCouncil,
  useUpdateMeeting,
} from './useGovernance';
import { governanceService } from '../../../services/governance';
import { toast } from 'sonner';

vi.mock('../../../services/governance', () => ({
  governanceService: {
    listCouncils: vi.fn(),
    createCouncil: vi.fn(),
    deleteCouncil: vi.fn(),
    updateCouncil: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
    listMeetings: vi.fn(),
    createMeeting: vi.fn(),
    updateMeeting: vi.fn(),
    completeMeeting: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockGovernanceService = vi.mocked(governanceService);
const mockToast = vi.mocked(toast);

describe('useGovernance hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches councils when tenantId exists', async () => {
    const councils = [
      { id: 'council-1', name: 'Conselho' },
      { id: 'council-2', name: 'Junta Diaconal' },
    ];
    mockGovernanceService.listCouncils.mockResolvedValue(councils as never);

    const { result } = renderHook(() => useGovernance('tenant-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGovernanceService.listCouncils).toHaveBeenCalledWith('tenant-1');
    expect(result.current.data).toEqual(councils);
  });

  it('does not fetch councils when tenantId is undefined', () => {
    const { result } = renderHook(() => useGovernance(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGovernanceService.listCouncils).not.toHaveBeenCalled();
  });

  it('handles council mutations with invalidation and toasts', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    mockGovernanceService.createCouncil.mockResolvedValue({ id: 'council-1' } as never);
    mockGovernanceService.updateCouncil.mockResolvedValue({ id: 'council-1' } as never);
    mockGovernanceService.deleteCouncil.mockResolvedValue(undefined as never);
    mockGovernanceService.addMember.mockResolvedValue({ id: 'council-1' } as never);
    mockGovernanceService.removeMember.mockResolvedValue({ id: 'council-1' } as never);

    const { result: createResult } = renderHook(() => useCreateCouncil('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });
    const { result: updateResult } = renderHook(() => useUpdateCouncil('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });
    const { result: deleteResult } = renderHook(() => useDeleteCouncil('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });
    const { result: addMemberResult } = renderHook(() => useAddCouncilMember('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });
    const { result: removeMemberResult } = renderHook(() => useRemoveCouncilMember('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    createResult.current.mutate({ name: 'Conselho', type: 'SESSION' });
    updateResult.current.mutate({ councilId: 'council-1', data: { description: 'Atualizado' } });
    deleteResult.current.mutate('council-1');
    addMemberResult.current.mutate({ councilId: 'council-1', memberId: 'member-1' });
    removeMemberResult.current.mutate({ councilId: 'council-1', memberId: 'member-1' });

    await waitFor(() => {
      expect(createResult.current.isSuccess).toBe(true);
      expect(updateResult.current.isSuccess).toBe(true);
      expect(deleteResult.current.isSuccess).toBe(true);
      expect(addMemberResult.current.isSuccess).toBe(true);
      expect(removeMemberResult.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [COUNCILS_KEY, 'tenant-1'] });
    expect(mockToast.success).toHaveBeenCalledWith('Órgão criado com sucesso!');
    expect(mockToast.success).toHaveBeenCalledWith('Órgão atualizado com sucesso!');
    expect(mockToast.success).toHaveBeenCalledWith('Órgão excluído com sucesso!');
    expect(mockToast.success).toHaveBeenCalledWith('Membro adicionado ao órgão!');
    expect(mockToast.success).toHaveBeenCalledWith('Membro removido do órgão!');
  });

  it('shows error toasts when council mutations fail', async () => {
    mockGovernanceService.createCouncil.mockRejectedValue(new Error('create failed'));
    mockGovernanceService.updateCouncil.mockRejectedValue(new Error('update failed'));
    mockGovernanceService.deleteCouncil.mockRejectedValue(new Error('delete failed'));
    mockGovernanceService.addMember.mockRejectedValue(new Error('add member failed'));
    mockGovernanceService.removeMember.mockRejectedValue(new Error('remove member failed'));

    const { result: createResult } = renderHook(() => useCreateCouncil('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: updateResult } = renderHook(() => useUpdateCouncil('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: deleteResult } = renderHook(() => useDeleteCouncil('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: addMemberResult } = renderHook(() => useAddCouncilMember('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: removeMemberResult } = renderHook(() => useRemoveCouncilMember('tenant-1'), {
      wrapper: createWrapper(),
    });

    createResult.current.mutate({ name: 'Conselho', type: 'SESSION' });
    updateResult.current.mutate({ councilId: 'council-1', data: { description: 'Atualizado' } });
    deleteResult.current.mutate('council-1');
    addMemberResult.current.mutate({ councilId: 'council-1', memberId: 'member-1' });
    removeMemberResult.current.mutate({ councilId: 'council-1', memberId: 'member-1' });

    await waitFor(() => {
      expect(createResult.current.isError).toBe(true);
      expect(updateResult.current.isError).toBe(true);
      expect(deleteResult.current.isError).toBe(true);
      expect(addMemberResult.current.isError).toBe(true);
      expect(removeMemberResult.current.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Erro ao criar órgão.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao atualizar órgão.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao excluir órgão.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao adicionar membro.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao remover membro.');
  });
});

describe('useMeeting hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches meetings only when tenantId and councilId exist', async () => {
    mockGovernanceService.listMeetings.mockResolvedValue([
      { id: 'meeting-1', agenda: 'Pauta 1' },
    ] as never);

    const { result } = renderHook(() => useMeetings('tenant-1', 'council-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGovernanceService.listMeetings).toHaveBeenCalledWith('tenant-1', 'council-1');

    const { result: disabledResult } = renderHook(() => useMeetings('tenant-1', undefined), {
      wrapper: createWrapper(),
    });

    expect(disabledResult.current.fetchStatus).toBe('idle');
  });

  it('handles meeting mutations with invalidation and toasts', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    mockGovernanceService.createMeeting.mockResolvedValue({ id: 'meeting-1' } as never);
    mockGovernanceService.updateMeeting.mockResolvedValue({ id: 'meeting-1' } as never);
    mockGovernanceService.completeMeeting.mockResolvedValue({ id: 'meeting-1' } as never);

    const { result: createResult } = renderHook(() => useCreateMeeting('tenant-1', 'council-1'), {
      wrapper: createWrapper({ queryClient }),
    });
    const { result: updateResult } = renderHook(() => useUpdateMeeting('tenant-1', 'council-1'), {
      wrapper: createWrapper({ queryClient }),
    });
    const { result: completeResult } = renderHook(() => useCompleteMeeting('tenant-1', 'council-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    createResult.current.mutate({ date: '2026-03-20', agenda: 'Pauta', meeting_type: 'ORDINARY' });
    updateResult.current.mutate({ meetingId: 'meeting-1', data: { minutes: 'Ata' } });
    completeResult.current.mutate('meeting-1');

    await waitFor(() => {
      expect(createResult.current.isSuccess).toBe(true);
      expect(updateResult.current.isSuccess).toBe(true);
      expect(completeResult.current.isSuccess).toBe(true);
    });

    expect(mockGovernanceService.createMeeting).toHaveBeenCalledWith('tenant-1', {
      date: '2026-03-20',
      agenda: 'Pauta',
      meeting_type: 'ORDINARY',
      council_id: 'council-1',
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [MEETINGS_KEY, 'tenant-1', 'council-1'],
    });
    expect(mockToast.success).toHaveBeenCalledWith('Reunião agendada com sucesso!');
    expect(mockToast.success).toHaveBeenCalledWith('Reunião atualizada com sucesso!');
    expect(mockToast.success).toHaveBeenCalledWith('Reunião finalizada com sucesso!');
  });

  it('shows error toasts when meeting mutations fail', async () => {
    mockGovernanceService.createMeeting.mockRejectedValue(new Error('create failed'));
    mockGovernanceService.updateMeeting.mockRejectedValue(new Error('update failed'));
    mockGovernanceService.completeMeeting.mockRejectedValue(new Error('complete failed'));

    const { result: createResult } = renderHook(() => useCreateMeeting('tenant-1', 'council-1'), {
      wrapper: createWrapper(),
    });
    const { result: updateResult } = renderHook(() => useUpdateMeeting('tenant-1', 'council-1'), {
      wrapper: createWrapper(),
    });
    const { result: completeResult } = renderHook(() => useCompleteMeeting('tenant-1', 'council-1'), {
      wrapper: createWrapper(),
    });

    createResult.current.mutate({ date: '2026-03-20' });
    updateResult.current.mutate({ meetingId: 'meeting-1', data: { minutes: 'Ata' } });
    completeResult.current.mutate('meeting-1');

    await waitFor(() => {
      expect(createResult.current.isError).toBe(true);
      expect(updateResult.current.isError).toBe(true);
      expect(completeResult.current.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Erro ao agendar reunião.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao atualizar reunião.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao finalizar reunião.');
  });
});
