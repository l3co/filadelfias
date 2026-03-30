import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { membersService } from "@/services/members";
import { useAuthStore } from "@/stores/authStore";
import type { Member } from "@/types/member";

export function useMembers(search?: string) {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["members", churchId, search],
    queryFn: () => membersService.getMembers(churchId!, { search }),
    enabled: Boolean(churchId),
  });
}

export function useMember(memberId?: string) {
  return useQuery({
    queryKey: ["member", memberId],
    queryFn: () => membersService.getMember(memberId!),
    enabled: Boolean(memberId),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["member-profile"],
    queryFn: membersService.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Pick<Member, "name" | "phone">>) => membersService.updateProfile(payload),
    onSuccess: (member) => {
      queryClient.setQueryData(["member-profile"], member);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
