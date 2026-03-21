import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '../../../test/utils';
import {
  PRAYER_KEY,
  useCreatePrayerRequest,
  useDeletePrayerRequest,
  usePrayFor,
  usePrayerRequests,
} from './usePrayer';
import { prayerService } from '../../../services/prayer';
import { toast } from 'sonner';

vi.mock('../../../services/prayer', () => ({
  prayerService: {
    listRequests: vi.fn(),
    createRequest: vi.fn(),
    prayFor: vi.fn(),
    deleteRequest: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPrayerService = vi.mocked(prayerService);
const mockToast = vi.mocked(toast);

describe('usePrayer hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches prayer requests when tenantId exists', async () => {
    const requests = [
      { id: 'prayer-1', content: 'Orem por saúde' },
      { id: 'prayer-2', content: 'Ação de graças' },
    ];
    mockPrayerService.listRequests.mockResolvedValue(requests as never);

    const { result } = renderHook(() => usePrayerRequests('tenant-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPrayerService.listRequests).toHaveBeenCalledWith('tenant-1', undefined);
    expect(result.current.data).toEqual(requests);
  });

  it('does not fetch prayer requests when tenantId is undefined', () => {
    const { result } = renderHook(() => usePrayerRequests(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockPrayerService.listRequests).not.toHaveBeenCalled();
  });

  it('creates prayer request, invalidates cache and shows success toast', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockPrayerService.createRequest.mockResolvedValue({ id: 'prayer-1' } as never);

    const { result } = renderHook(() => useCreatePrayerRequest('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.mutate({
      content: 'Pedido de oração',
      category: 'Saúde',
      is_anonymous: false,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPrayerService.createRequest).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({ content: 'Pedido de oração' }),
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [PRAYER_KEY, 'tenant-1'],
    });
    expect(mockToast.success).toHaveBeenCalledWith('Pedido de oração compartilhado!');
  });

  it('registers prayer and invalidates cache without success toast', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockPrayerService.prayFor.mockResolvedValue({ message: 'ok', prayer_count: 3 } as never);

    const { result } = renderHook(() => usePrayFor('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.mutate('prayer-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPrayerService.prayFor).toHaveBeenCalledWith('tenant-1', 'prayer-1');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [PRAYER_KEY, 'tenant-1'],
    });
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('deletes prayer request, invalidates cache and shows success toast', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockPrayerService.deleteRequest.mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useDeletePrayerRequest('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.mutate('prayer-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPrayerService.deleteRequest).toHaveBeenCalledWith('tenant-1', 'prayer-1');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [PRAYER_KEY, 'tenant-1'],
    });
    expect(mockToast.success).toHaveBeenCalledWith('Pedido removido.');
  });

  it('shows error toasts when mutations fail', async () => {
    mockPrayerService.createRequest.mockRejectedValue(new Error('create failed'));
    mockPrayerService.prayFor.mockRejectedValue(new Error('pray failed'));
    mockPrayerService.deleteRequest.mockRejectedValue(new Error('delete failed'));

    const { result: createResult } = renderHook(() => useCreatePrayerRequest('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: prayResult } = renderHook(() => usePrayFor('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: deleteResult } = renderHook(() => useDeletePrayerRequest('tenant-1'), {
      wrapper: createWrapper(),
    });

    createResult.current.mutate({ content: 'Pedido' });
    prayResult.current.mutate('prayer-1');
    deleteResult.current.mutate('prayer-1');

    await waitFor(() => {
      expect(createResult.current.isError).toBe(true);
      expect(prayResult.current.isError).toBe(true);
      expect(deleteResult.current.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Erro ao compartilhar pedido.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao registrar oração.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao remover pedido.');
  });
});
