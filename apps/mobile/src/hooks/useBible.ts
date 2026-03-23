import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import {
    bibleService,
    BibleChapter,
    BibleHighlight,
    BibleNote,
    BibleSearchResponse,
    BibleVersion,
    BibleBook,
    ReadingPlan,
    ReadingPlanProgress,
} from '@/services/bible';
import { offlineService } from '@/services/offline';
import { toast } from '@/lib/toast';

const CACHE_PREFIX = 'bible_cache:';

async function getCachedData<T>(key: string): Promise<T | null> {
    try {
        const raw = await SecureStore.getItemAsync(`${CACHE_PREFIX}${key}`);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

async function setCachedData<T>(key: string, data: T): Promise<void> {
    try {
        await SecureStore.setItemAsync(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
    } catch {
        // ignore cache failures
    }
}

export function useBibleVersions() {
    return useQuery<BibleVersion[]>({
        queryKey: ['bible', 'versions'],
        queryFn: async () => {
            try {
                const versions = await bibleService.getVersions();
                await setCachedData('versions', versions);
                return versions;
            } catch (error) {
                const cached = await getCachedData<BibleVersion[]>('versions');
                if (cached) {
                    return cached;
                }
                throw error;
            }
        },
        staleTime: 1000 * 60 * 60 * 24,
    });
}

export function useBibleBooks(version?: string) {
    return useQuery<BibleBook[]>({
        queryKey: ['bible', 'books', version],
        queryFn: async () => {
            const cacheKey = `books:${version || 'nvi'}`;
            try {
                const books = await bibleService.getBooks(version);
                await setCachedData(cacheKey, books);
                return books;
            } catch (error) {
                const cached = await getCachedData<BibleBook[]>(cacheKey);
                if (cached) {
                    return cached;
                }
                throw error;
            }
        },
        staleTime: 1000 * 60 * 60 * 24,
    });
}

export function useBibleChapter(book?: string, chapter?: number, version?: string) {
    return useQuery<BibleChapter>({
        queryKey: ['bible', 'chapter', book, chapter, version],
        queryFn: async () => {
            const versionCode = version || 'nvi';
            const cacheKey = `chapter:${versionCode}:${book}:${chapter}`;

            try {
                const chapterData = await bibleService.getChapter(book!, chapter!, version);
                await setCachedData(cacheKey, chapterData);
                return chapterData;
            } catch (error) {
                const offline = await offlineService.getBibleChapterOffline(book!, chapter!, versionCode);
                if (offline) {
                    return offline;
                }

                const cached = await getCachedData<BibleChapter>(cacheKey);
                if (cached) {
                    return cached;
                }
                throw error;
            }
        },
        enabled: Boolean(book && chapter),
        staleTime: 1000 * 60 * 60,
    });
}

export function useBibleSearch(params: {
    query: string;
    version?: string;
    testament?: 'OT' | 'NT';
    limit?: number;
    offset?: number;
}) {
    return useQuery<BibleSearchResponse>({
        queryKey: ['bible', 'search', params],
        queryFn: () => bibleService.searchVerses(params),
        enabled: params.query.trim().length >= 2,
    });
}

export function useBibleNotes(
    tenantId?: string,
    filters?: { version?: string; book?: string; chapter?: number }
) {
    return useQuery<BibleNote[]>({
        queryKey: ['bible', 'notes', tenantId, filters],
        queryFn: () => bibleService.getNotes(tenantId!, filters),
        enabled: Boolean(tenantId),
    });
}

export function useBibleHighlights(
    tenantId?: string,
    filters?: { version?: string; book?: string; chapter?: number }
) {
    return useQuery<BibleHighlight[]>({
        queryKey: ['bible', 'highlights', tenantId, filters],
        queryFn: () => bibleService.getHighlights(tenantId!, filters),
        enabled: Boolean(tenantId),
    });
}

export function useCreateBibleNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bibleService.createNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'notes'] });
            toast.success('Anotação salva');
        },
        onError: () => toast.error('Erro ao salvar anotação'),
    });
}

export function useUpdateBibleNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, content }: { id: string; content: string }) => bibleService.updateNote(id, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'notes'] });
            toast.success('Anotação atualizada');
        },
        onError: () => toast.error('Erro ao atualizar anotação'),
    });
}

export function useDeleteBibleNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bibleService.deleteNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'notes'] });
            toast.success('Anotação removida');
        },
        onError: () => toast.error('Erro ao remover anotação'),
    });
}

export function useCreateBibleHighlight() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bibleService.createHighlight,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'highlights'] });
            toast.success('Destaque salvo');
        },
        onError: () => toast.error('Erro ao salvar destaque'),
    });
}

export function useDeleteBibleHighlight() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bibleService.deleteHighlight,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'highlights'] });
            toast.success('Destaque removido');
        },
        onError: () => toast.error('Erro ao remover destaque'),
    });
}

export function useReadingPlans(tenantId?: string) {
    return useQuery<ReadingPlan[]>({
        queryKey: ['bible', 'reading-plans', tenantId],
        queryFn: async () => {
            const cacheKey = `reading-plans:${tenantId}`;
            try {
                const plans = await bibleService.getReadingPlans(tenantId!);
                await setCachedData(cacheKey, plans);
                return plans;
            } catch (error) {
                const cached = await getCachedData<ReadingPlan[]>(cacheKey);
                if (cached) {
                    return cached;
                }
                throw error;
            }
        },
        enabled: Boolean(tenantId),
        staleTime: 1000 * 60 * 30,
    });
}

export function useReadingPlanProgress(planId?: string, enabled: boolean = true) {
    return useQuery<ReadingPlanProgress>({
        queryKey: ['bible', 'reading-plans', planId, 'progress'],
        queryFn: async () => {
            const cacheKey = `reading-progress:${planId}`;
            try {
                const progress = await bibleService.getReadingPlanProgress(planId!);
                await setCachedData(cacheKey, progress);
                return progress;
            } catch (error) {
                const cached = await getCachedData<ReadingPlanProgress>(cacheKey);
                if (cached) {
                    return cached;
                }
                throw error;
            }
        },
        enabled: Boolean(planId && enabled),
        retry: false,
    });
}

export function useReadingPlansProgress(planIds: string[]) {
    return useQueries({
        queries: planIds.map((planId) => ({
            queryKey: ['bible', 'reading-plans', planId, 'progress'],
            queryFn: () => bibleService.getReadingPlanProgress(planId),
            enabled: Boolean(planId),
            retry: false,
        })),
    });
}

export function useStartReadingPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bibleService.startReadingPlan,
        onSuccess: (progress) => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'reading-plans'] });
            queryClient.invalidateQueries({ queryKey: ['bible', 'reading-plans', progress.plan_id, 'progress'] });
            toast.success('Plano iniciado');
        },
        onError: () => toast.error('Erro ao iniciar plano'),
    });
}

export function useMarkReadingPlanDay() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ planId, day }: { planId: string; day: number }) => bibleService.markReadingPlanDay(planId, day),
        onSuccess: (progress) => {
            queryClient.invalidateQueries({ queryKey: ['bible', 'reading-plans'] });
            queryClient.invalidateQueries({ queryKey: ['bible', 'reading-plans', progress.plan_id, 'progress'] });
            toast.success('Leitura marcada');
        },
        onError: () => toast.error('Erro ao atualizar progresso'),
    });
}
