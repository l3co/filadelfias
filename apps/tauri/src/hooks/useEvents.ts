import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/services/events";
import { useAuthStore } from "@/stores/authStore";

export function useEvents() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["events", churchId],
    queryFn: () => eventsService.getEvents(churchId!),
    enabled: Boolean(churchId),
  });
}

export function useEvent(eventId?: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventsService.getEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useMutation({
    mutationFn: (payload: { title: string; starts_at: string; ends_at?: string; location?: string; description?: string }) =>
      eventsService.createEvent(churchId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", churchId] });
    },
  });
}
