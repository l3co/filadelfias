import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '../../../test/utils';
import { useCreateEvent, useDeleteEvent, useEvents, useUpdateEvent, EVENTS_KEY } from './useEvents';
import { eventService } from '../../../services/events';
import { toast } from 'sonner';

vi.mock('../../../services/events', async () => {
  const actual = await vi.importActual('../../../services/events');

  return {
    ...actual,
    eventService: {
      listEvents: vi.fn(),
      createEvent: vi.fn(),
      updateEvent: vi.fn(),
      deleteEvent: vi.fn(),
    },
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockEventService = vi.mocked(eventService);
const mockToast = vi.mocked(toast);

describe('useEvents hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches events when tenantId exists', async () => {
    const mockEvents = [{ id: '1', title: 'Culto', start_date: '2026-03-20T19:00:00Z' }];
    mockEventService.listEvents.mockResolvedValue(mockEvents as never);

    const { result } = renderHook(() => useEvents('tenant-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockEventService.listEvents).toHaveBeenCalledWith('tenant-1');
    expect(result.current.data).toEqual(mockEvents);
  });

  it('creates, updates and deletes events with cache invalidation and toasts', async () => {
    mockEventService.createEvent.mockResolvedValue({ id: '1' } as never);
    mockEventService.updateEvent.mockResolvedValue({ id: '1' } as never);
    mockEventService.deleteEvent.mockResolvedValue(undefined as never);

    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result: createResult } = renderHook(() => useCreateEvent('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });
    const { result: updateResult } = renderHook(() => useUpdateEvent('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });
    const { result: deleteResult } = renderHook(() => useDeleteEvent('tenant-1'), {
      wrapper: createWrapper({ queryClient }),
    });

    createResult.current.mutate({
      title: 'Culto',
      start_date: '2026-03-20T19:00:00Z',
    });
    updateResult.current.mutate({
      eventId: '1',
      data: { title: 'Culto Atualizado' },
    });
    deleteResult.current.mutate('1');

    await waitFor(() => {
      expect(createResult.current.isSuccess).toBe(true);
      expect(updateResult.current.isSuccess).toBe(true);
      expect(deleteResult.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [EVENTS_KEY, 'tenant-1'] });
    expect(mockToast.success).toHaveBeenCalledWith('Evento criado com sucesso!');
    expect(mockToast.success).toHaveBeenCalledWith('Evento atualizado com sucesso!');
    expect(mockToast.success).toHaveBeenCalledWith('Evento excluído com sucesso!');
  });

  it('shows error toasts when mutations fail', async () => {
    mockEventService.createEvent.mockRejectedValue(new Error('create failed'));
    mockEventService.updateEvent.mockRejectedValue(new Error('update failed'));
    mockEventService.deleteEvent.mockRejectedValue(new Error('delete failed'));

    const { result: createResult } = renderHook(() => useCreateEvent('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: updateResult } = renderHook(() => useUpdateEvent('tenant-1'), {
      wrapper: createWrapper(),
    });
    const { result: deleteResult } = renderHook(() => useDeleteEvent('tenant-1'), {
      wrapper: createWrapper(),
    });

    createResult.current.mutate({ title: 'Culto', start_date: '2026-03-20T19:00:00Z' });
    updateResult.current.mutate({ eventId: '1', data: { title: 'X' } });
    deleteResult.current.mutate('1');

    await waitFor(() => {
      expect(createResult.current.isError).toBe(true);
      expect(updateResult.current.isError).toBe(true);
      expect(deleteResult.current.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Erro ao criar evento.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao atualizar evento.');
    expect(mockToast.error).toHaveBeenCalledWith('Erro ao excluir evento.');
  });
});
