import { useQuery } from "@tanstack/react-query";
import { bibleService } from "@/services/bible";

export function useBibleVersions() {
  return useQuery({
    queryKey: ["bible-versions"],
    queryFn: () => bibleService.getVersions(),
  });
}

export function useBibleBooks(version: string) {
  return useQuery({
    queryKey: ["bible-books", version],
    queryFn: () => bibleService.getBooks(version),
    enabled: Boolean(version),
  });
}

export function useBibleChapter(version: string, book: string, chapter: number) {
  return useQuery({
    queryKey: ["bible-chapter", version, book, chapter],
    queryFn: () => bibleService.getChapter(book, chapter, version),
    enabled: Boolean(version && book && chapter > 0),
  });
}

export function useBibleSearch(query: string, version: string, testament?: "OT" | "NT") {
  return useQuery({
    queryKey: ["bible-search", query, version, testament],
    queryFn: () => bibleService.search(query, version, testament),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 30,
  });
}
