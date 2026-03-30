import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { titheService } from "@/services/tithe";
import { useAuthStore } from "@/stores/authStore";

export function useTithes() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["tithes", churchId],
    queryFn: () => titheService.getTithes(churchId!),
    enabled: Boolean(churchId),
  });
}

export function useTitheSummary() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["tithes", "summary", churchId],
    queryFn: () => titheService.getSummary(churchId!),
    enabled: Boolean(churchId),
  });
}

export function useCreateTithe() {
  const churchId = useAuthStore((state) => state.currentChurchId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { amount: number; type: "DIZIMO" | "OFERTA"; notes?: string }) =>
      titheService.createTithe(churchId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tithes", churchId] });
      queryClient.invalidateQueries({ queryKey: ["tithes", "summary", churchId] });
    },
  });
}
