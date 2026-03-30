import { useQuery } from "@tanstack/react-query";
import { ebdService } from "@/services/ebd";
import { useAuthStore } from "@/stores/authStore";

export function useEbdClasses() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["ebd", "classes", churchId],
    queryFn: () => ebdService.getClasses(churchId!),
    enabled: Boolean(churchId),
  });
}

export function useMyEbdClass() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["ebd", "my-class", churchId],
    queryFn: () => ebdService.getMyClass(churchId!),
    enabled: Boolean(churchId),
  });
}

export function useEbdLessons(classId?: string) {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["ebd", "lessons", churchId, classId],
    queryFn: () => ebdService.getLessons(churchId!, classId!),
    enabled: Boolean(churchId && classId),
  });
}
