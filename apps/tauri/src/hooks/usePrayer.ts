import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { prayerService } from "@/services/prayer";
import { useAuthStore } from "@/stores/authStore";
import type { CreatePrayerInput } from "@/types/community";

export function usePrayers() {
  const churchId = useAuthStore((state) => state.currentChurchId);
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["prayers", churchId, userId],
    queryFn: () => prayerService.getPrayers(churchId!, userId),
    enabled: Boolean(churchId),
  });
}

export function usePrayer(prayerId?: string) {
  const churchId = useAuthStore((state) => state.currentChurchId);
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["prayer", prayerId, churchId, userId],
    queryFn: () => prayerService.getPrayer(prayerId!, churchId ?? undefined, userId),
    enabled: Boolean(prayerId),
  });
}

export function useCreatePrayer() {
  const churchId = useAuthStore((state) => state.currentChurchId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePrayerInput) => prayerService.createPrayer(churchId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers", churchId] });
    },
  });
}

export function usePrayForRequest() {
  const churchId = useAuthStore((state) => state.currentChurchId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prayerId: string) => prayerService.pray(prayerId, churchId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers", churchId] });
      queryClient.invalidateQueries({ queryKey: ["prayer"] });
    },
  });
}
