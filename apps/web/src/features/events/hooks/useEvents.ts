import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../../../services/events';
import type { CreateEventDTO, UpdateEventDTO } from '../../../services/events';
import { toast } from 'sonner';

export const EVENTS_KEY = 'events';

export function useEvents(tenantId: string | undefined) {
    return useQuery({
        queryKey: [EVENTS_KEY, tenantId],
        queryFn: () => eventService.listEvents(tenantId!),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCreateEvent(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEventDTO) => eventService.createEvent(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EVENTS_KEY, tenantId] });
            toast.success('Evento criado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao criar evento.');
        }
    });
}

export function useUpdateEvent(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: UpdateEventDTO }) => 
            eventService.updateEvent(tenantId!, eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EVENTS_KEY, tenantId] });
            toast.success('Evento atualizado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao atualizar evento.');
        }
    });
}

export function useDeleteEvent(tenantId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => eventService.deleteEvent(tenantId!, eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EVENTS_KEY, tenantId] });
            toast.success('Evento excluído com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao excluir evento.');
        }
    });
}
