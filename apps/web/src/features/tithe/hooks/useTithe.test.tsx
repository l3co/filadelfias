import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '../../../test/utils';
import {
  useAllTitheRecords,
  useMyTitheRecords,
  useMyTitheSummary,
  usePendingTitheRecords,
  useTitheMutations,
} from './useTithe';
import { titheService } from '../../../services/tithe';

vi.mock('../../../services/tithe', async () => {
  const actual = await vi.importActual('../../../services/tithe');

  return {
    ...actual,
    titheService: {
      submitRecord: vi.fn(),
      getMyRecords: vi.fn(),
      getMySummary: vi.fn(),
      deleteMyRecord: vi.fn(),
      getPendingRecords: vi.fn(),
      getAllRecords: vi.fn(),
      approveRecord: vi.fn(),
    },
  };
});

const mockTitheService = vi.mocked(titheService);

describe('useTithe hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches my records, summary, pending and all records', async () => {
    mockTitheService.getMyRecords.mockResolvedValue([{ id: 'record-1', amount: 100 }] as never);
    mockTitheService.getMySummary.mockResolvedValue({ total: 100, count_pending: 1 } as never);
    mockTitheService.getPendingRecords.mockResolvedValue([{ id: 'record-2', amount: 50 }] as never);
    mockTitheService.getAllRecords.mockResolvedValue([{ id: 'record-3', amount: 150 }] as never);

    const { result: myRecordsResult } = renderHook(() => useMyTitheRecords('tenant-1', 2026), {
      wrapper: createWrapper(),
    });
    const { result: summaryResult } = renderHook(() => useMyTitheSummary('tenant-1', 2026), {
      wrapper: createWrapper(),
    });
    const { result: pendingResult } = renderHook(() => usePendingTitheRecords('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: allResult } = renderHook(() => useAllTitheRecords('tenant-1', 2026), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(myRecordsResult.current.isSuccess).toBe(true);
      expect(summaryResult.current.isSuccess).toBe(true);
      expect(pendingResult.current.isSuccess).toBe(true);
      expect(allResult.current.isSuccess).toBe(true);
    });

    expect(mockTitheService.getMyRecords).toHaveBeenCalledWith('tenant-1', 2026);
    expect(mockTitheService.getMySummary).toHaveBeenCalledWith('tenant-1', 2026);
    expect(mockTitheService.getPendingRecords).toHaveBeenCalledWith('tenant-1');
    expect(mockTitheService.getAllRecords).toHaveBeenCalledWith('tenant-1', 2026);
  });

  it('does not fetch when tenantId is missing', () => {
    renderHook(() => useMyTitheRecords(undefined, 2026), {
      wrapper: createWrapper(),
    });
    renderHook(() => useMyTitheSummary(undefined, 2026), {
      wrapper: createWrapper(),
    });
    renderHook(() => usePendingTitheRecords(undefined), {
      wrapper: createWrapper(),
    });
    renderHook(() => useAllTitheRecords(undefined, 2026), {
      wrapper: createWrapper(),
    });

    expect(mockTitheService.getMyRecords).not.toHaveBeenCalled();
    expect(mockTitheService.getMySummary).not.toHaveBeenCalled();
    expect(mockTitheService.getPendingRecords).not.toHaveBeenCalled();
    expect(mockTitheService.getAllRecords).not.toHaveBeenCalled();
  });

  it('invalidates related queries after submit, delete and approve mutations', async () => {
    mockTitheService.submitRecord.mockResolvedValue({ id: 'record-1' } as never);
    mockTitheService.deleteMyRecord.mockResolvedValue({ success: true } as never);
    mockTitheService.approveRecord.mockResolvedValue({ id: 'record-1', status: 'APPROVED' } as never);

    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useTitheMutations('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    result.current.submitRecord.mutate({
      amount: 100,
      type: 'DIZIMO',
      date: '2026-03-19',
    });
    result.current.deleteRecord.mutate('record-1');
    result.current.approveRecord.mutate({
      recordId: 'record-2',
      data: { status: 'APPROVED' },
    });

    await waitFor(() => {
      expect(result.current.submitRecord.isSuccess).toBe(true);
      expect(result.current.deleteRecord.isSuccess).toBe(true);
      expect(result.current.approveRecord.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tithe-records-me'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tithe-summary-me'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tithe-records-pending'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tithe-records-all'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['financial-transactions'] });
  });
});
