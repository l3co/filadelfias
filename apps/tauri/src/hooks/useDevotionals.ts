import { useQuery } from "@tanstack/react-query";
import { devotionalsService } from "@/services/devotionals";
import { useAuthStore } from "@/stores/authStore";

export function useDevotionals() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["devotionals", churchId],
    queryFn: () => devotionalsService.getDevotionals(churchId ?? undefined),
    enabled: Boolean(churchId),
  });
}

export function useTodayDevotional() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["devotional-today", churchId],
    queryFn: () => devotionalsService.getTodayDevotional(churchId ?? undefined),
    enabled: Boolean(churchId),
  });
}
