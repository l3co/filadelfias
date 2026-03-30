import { useQuery } from "@tanstack/react-query";
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
