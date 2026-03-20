import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '../../../test/utils';
import {
  COUNTRIES_KEY,
  MISSIONS_KEY,
  useCountries,
  useCreateCountry,
  useCreateMissionary,
  useDeleteMissionary,
  useMissions,
} from './useMissions';
import { missionService } from '../../../services/missions';
import { toast } from 'sonner';

vi.mock('../../../services/missions', () => ({
  missionService: {
    listCountries: vi.fn(),
    createCountry: vi.fn(),
    listMissionaries: vi.fn(),
    createMissionary: vi.fn(),
    deleteMissionary: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockMissionService = vi.mocked(missionService);
const mockToast = vi.mocked(toast);

describe('useMissions hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches countries and missionaries when tenantId exists', async () => {
    mockMissionService.listCountries.mockResolvedValue([
      { id: 'country-1', code: 'BR', name: 'Brasil' },
    ] as never);
    mockMissionService.listMissionaries.mockResolvedValue([
      { id: 'missionary-1', name: 'João', field_name: 'Campo Sul' },
    ] as never);

    const { result: countriesResult } = renderHook(() => useCountries('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: missionsResult } = renderHook(() => useMissions('tenant-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(countriesResult.current.isSuccess).toBe(true);
      expect(missionsResult.current.isSuccess).toBe(true);
    });

    expect(mockMissionService.listCountries).toHaveBeenCalledWith('tenant-1');
    expect(mockMissionService.listMissionaries).toHaveBeenCalledWith('tenant-1');
  });

  it('does not fetch countries or missionaries when tenantId is undefined', () => {
    renderHook(() => useCountries(undefined), {
      wrapper: createWrapper(),
    });
    renderHook(() => useMissions(undefined), {
      wrapper: createWrapper(),
    });

    expect(mockMissionService.listCountries).not.toHaveBeenCalled();
    expect(mockMissionService.listMissionaries).not.toHaveBeenCalled();
  });

  it('creates country and invalidates country cache', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockMissionService.createCountry.mockResolvedValue({ id: 'country-1' } as never);

    const { result } = renderHook(() => useCreateCountry('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.mutate({ code: 'BR', name: 'Brasil' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockMissionService.createCountry).toHaveBeenCalledWith('tenant-1', {
      code: 'BR',
      name: 'Brasil',
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [COUNTRIES_KEY, 'tenant-1'],
    });
    expect(mockToast.error).not.toHaveBeenCalledWith('Erro ao cadastrar país.');
  });

  it('creates missionary, invalidates cache and shows success toast', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockMissionService.createMissionary.mockResolvedValue({ id: 'missionary-1' } as never);

    const { result } = renderHook(() => useCreateMissionary('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.mutate({
      name: 'João',
      field_name: 'Campo Sul',
      country_code: 'BR',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockMissionService.createMissionary).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({ name: 'João', country_code: 'BR' }),
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [MISSIONS_KEY, 'tenant-1'],
    });
    expect(mockToast.success).toHaveBeenCalledWith('Missionário criado com sucesso!');
  });

  it('deletes missionary, invalidates cache and shows success toast', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockMissionService.deleteMissionary.mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useDeleteMissionary('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.mutate('missionary-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockMissionService.deleteMissionary).toHaveBeenCalledWith('tenant-1', 'missionary-1');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [MISSIONS_KEY, 'tenant-1'],
    });
    expect(mockToast.success).toHaveBeenCalledWith('Missionário excluído com sucesso!');
  });

  it('shows error toasts when mutations fail', async () => {
    mockMissionService.createCountry.mockRejectedValue(new Error('country failed'));
    mockMissionService.createMissionary.mockRejectedValue(new Error('missionary failed'));
    mockMissionService.deleteMissionary.mockRejectedValue(new Error('delete failed'));

    const { result: countryResult } = renderHook(() => useCreateCountry('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: createMissionaryResult } = renderHook(() => useCreateMissionary('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: deleteMissionaryResult } = renderHook(() => useDeleteMissionary('tenant-1'), {
      wrapper: createWrapper(),
    });

    countryResult.current.mutate({ code: 'BR', name: 'Brasil' });
    createMissionaryResult.current.mutate({ name: 'João', field_name: 'Campo Sul', country_code: 'BR' });
    deleteMissionaryResult.current.mutate('missionary-1');

    await waitFor(() => {
      expect(countryResult.current.isError).toBe(true);
      expect(createMissionaryResult.current.isError).toBe(true);
      expect(deleteMissionaryResult.current.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Erro ao cadastrar país.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao cadastrar missionário.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao excluir missionário.');
  });
});
