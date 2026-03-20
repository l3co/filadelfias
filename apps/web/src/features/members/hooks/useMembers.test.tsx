import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper, createTestQueryClient } from '../../../test/utils';
import { useCreateMember, useMembers, useUpdateMember, MEMBERS_QUERY_KEY } from './useMembers';
import { membersService } from '../../../services/members';
import { toast } from 'sonner';

vi.mock('../../../services/members', () => ({
  membersService: {
    listMembers: vi.fn(),
    createMember: vi.fn(),
    updateMember: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockMembersService = vi.mocked(membersService);
const mockToast = vi.mocked(toast);

describe('useMembers hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches members when tenantId exists', async () => {
    const queryClient = createTestQueryClient();
    const mockMembers = [
      { id: '1', full_name: 'João Silva', office: 'MEMBRO' },
      { id: '2', full_name: 'Maria Santos', office: 'DIACONO' },
    ];

    mockMembersService.listMembers.mockResolvedValue(mockMembers as never);

    const { result } = renderHook(() => useMembers('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockMembersService.listMembers).toHaveBeenCalledWith('tenant-1');
    expect(result.current.data).toEqual(mockMembers);
  });

  it('does not fetch members when tenantId is undefined', () => {
    const { result } = renderHook(() => useMembers(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockMembersService.listMembers).not.toHaveBeenCalled();
  });

  it('creates a member, invalidates cache and shows success toast', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const createdMember = { id: '3', full_name: 'Novo Membro' };

    mockMembersService.createMember.mockResolvedValue(createdMember as never);

    const { result } = renderHook(() => useCreateMember('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.mutate({
      full_name: 'Novo Membro',
      email: 'novo@example.com',
      status: 'COMUNGANTE',
      office: 'MEMBRO',
    } as never);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockMembersService.createMember).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({ full_name: 'Novo Membro' }),
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [MEMBERS_QUERY_KEY, 'tenant-1'],
    });
    expect(mockToast.success).toHaveBeenCalledWith('Membro criado com sucesso!');
  });

  it('shows error toast when create member fails', async () => {
    mockMembersService.createMember.mockRejectedValue(new Error('create failed'));

    const { result } = renderHook(() => useCreateMember('tenant-1'), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      full_name: 'Novo Membro',
    } as never);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Erro ao criar membro. Verifique os dados.');
  });

  it('updates a member, invalidates cache and shows success toast', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    mockMembersService.updateMember.mockResolvedValue({
      id: 'member-1',
      full_name: 'Nome Atualizado',
    } as never);

    const { result } = renderHook(() => useUpdateMember('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.mutate({
      memberId: 'member-1',
      data: { full_name: 'Nome Atualizado' },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockMembersService.updateMember).toHaveBeenCalledWith(
      'tenant-1',
      'member-1',
      { full_name: 'Nome Atualizado' },
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [MEMBERS_QUERY_KEY, 'tenant-1'],
    });
    expect(mockToast.success).toHaveBeenCalledWith('Membro atualizado com sucesso!');
  });

  it('shows error toast when update member fails', async () => {
    mockMembersService.updateMember.mockRejectedValue(new Error('update failed'));

    const { result } = renderHook(() => useUpdateMember('tenant-1'), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      memberId: 'member-1',
      data: { full_name: 'Nome Atualizado' },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Erro ao atualizar membro. Verifique os dados.');
  });
});
