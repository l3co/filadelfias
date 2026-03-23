import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bibleService, type BibleHighlight, type BibleNote } from '../services/bible';

export function useBibleVersions() {
  return useQuery({
    queryKey: ['bible', 'versions'],
    queryFn: () => bibleService.getVersions(),
    staleTime: Infinity,
  });
}

export function useBibleBooks(version: string) {
  return useQuery({
    queryKey: ['bible', 'books', version],
    queryFn: () => bibleService.getBooks(version),
    staleTime: Infinity,
  });
}

export function useBibleChapter(book: string | undefined, chapter: number, version: string) {
  return useQuery({
    queryKey: ['bible', 'chapter', version, book, chapter],
    queryFn: () => bibleService.getChapter(book!, chapter, version),
    enabled: !!book && Number.isFinite(chapter),
  });
}

export function useBibleSearch(query: string, version: string, testament?: 'OT' | 'NT') {
  return useQuery({
    queryKey: ['bible', 'search', query, version, testament],
    queryFn: () => bibleService.searchVerses({ query, version, testament, limit: 30 }),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 30,
  });
}

export function useBibleNotes(
  tenantId: string | undefined,
  filters?: { version?: string; book?: string; chapter?: number }
) {
  return useQuery<BibleNote[]>({
    queryKey: ['bible', 'notes', tenantId, filters],
    queryFn: () => bibleService.getNotes(tenantId!, filters),
    enabled: !!tenantId,
  });
}

export function useBibleHighlights(
  tenantId: string | undefined,
  filters?: { version?: string; book?: string; chapter?: number }
) {
  return useQuery<BibleHighlight[]>({
    queryKey: ['bible', 'highlights', tenantId, filters],
    queryFn: () => bibleService.getHighlights(tenantId!, filters),
    enabled: !!tenantId,
  });
}

export function useCreateBibleNote(tenantId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      version_code: string;
      book_abbrev: string;
      chapter: number;
      verse: number;
      content: string;
      is_public?: boolean;
    }) => bibleService.createNote({ tenant_id: tenantId!, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'notes', tenantId] });
      toast.success('Anotação salva.');
    },
    onError: () => {
      toast.error('Não foi possível salvar a anotação.');
    },
  });
}

export function useUpdateBibleNote(tenantId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => bibleService.updateNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'notes', tenantId] });
      toast.success('Anotação atualizada.');
    },
    onError: () => {
      toast.error('Não foi possível atualizar a anotação.');
    },
  });
}

export function useDeleteBibleNote(tenantId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bibleService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'notes', tenantId] });
      toast.success('Anotação removida.');
    },
    onError: () => {
      toast.error('Não foi possível remover a anotação.');
    },
  });
}

export function useCreateBibleHighlight(tenantId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      version_code: string;
      book_abbrev: string;
      chapter: number;
      verse: number;
      color?: string;
      category?: string;
    }) => bibleService.createHighlight({ tenant_id: tenantId!, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'highlights', tenantId] });
      toast.success('Versículo destacado.');
    },
    onError: () => {
      toast.error('Não foi possível destacar o versículo.');
    },
  });
}

export function useDeleteBibleHighlight(tenantId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bibleService.deleteHighlight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'highlights', tenantId] });
      toast.success('Destaque removido.');
    },
    onError: () => {
      toast.error('Não foi possível remover o destaque.');
    },
  });
}
