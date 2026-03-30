import { useQuery } from "@tanstack/react-query";
import { missionsService } from "@/services/missions";
import { useAuthStore } from "@/stores/authStore";

export function useMissions() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["missions", churchId],
    queryFn: () => missionsService.getMissions(churchId!),
    enabled: Boolean(churchId),
  });
}

export function useMission(missionId?: string) {
  return useQuery({
    queryKey: ["mission", missionId],
    queryFn: () => missionsService.getMission(missionId!),
    enabled: Boolean(missionId),
  });
}
