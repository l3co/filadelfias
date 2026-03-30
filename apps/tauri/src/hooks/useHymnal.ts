import { useQuery } from "@tanstack/react-query";
import { hymnalService } from "@/services/hymnal";

export function useHymns() {
  return useQuery({
    queryKey: ["hymns"],
    queryFn: () => hymnalService.getHymns(),
  });
}

export function useHymn(number?: number) {
  return useQuery({
    queryKey: ["hymn", number],
    queryFn: () => hymnalService.getHymn(number!),
    enabled: typeof number === "number" && Number.isFinite(number),
  });
}
