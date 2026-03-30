import { useQuery } from "@tanstack/react-query";
import { manualService } from "@/services/manual";

export function useManualStructure() {
  return useQuery({
    queryKey: ["manual-structure"],
    queryFn: () => manualService.getStructure(),
  });
}

export function useManualArticle(articleId?: string) {
  return useQuery({
    queryKey: ["manual-article", articleId],
    queryFn: () => manualService.getArticle(articleId!),
    enabled: Boolean(articleId),
  });
}
