import { QueryClient } from '@tanstack/react-query';

/**
 * Configuração otimizada do React Query para mobile
 * 
 * staleTime: Tempo que os dados são considerados "frescos" (não refetch automático)
 * gcTime: Tempo que dados inativos ficam em cache antes de serem removidos
 * retry: Número de tentativas em caso de erro
 * refetchOnWindowFocus: Desabilitado pois mobile não tem "window focus"
 * refetchOnReconnect: Refetch quando reconectar à internet
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,     // 5 minutos
            gcTime: 1000 * 60 * 30,       // 30 minutos
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            networkMode: 'offlineFirst',
        },
        mutations: {
            retry: 1,
            networkMode: 'offlineFirst',
        },
    },
});

/**
 * Query keys padronizadas para consistência
 */
export const queryKeys = {
    members: (tenantId: string) => ['members', tenantId] as const,
    prayer: (tenantId: string) => ['prayer', tenantId] as const,
    events: (tenantId: string) => ['events', tenantId] as const,
    devotionals: (tenantId: string) => ['devotionals', tenantId] as const,
    missions: (tenantId: string) => ['missions', tenantId] as const,
    tithes: (tenantId: string) => ['my-tithes', tenantId] as const,
    tithesSummary: (tenantId: string) => ['my-tithes', 'summary', tenantId] as const,
    ebd: {
        classes: (tenantId: string) => ['ebd', 'classes', tenantId] as const,
        myClass: (tenantId: string) => ['ebd', 'my-class', tenantId] as const,
    },
    hymnal: () => ['hymnal'] as const,
    bible: {
        versions: () => ['bible', 'versions'] as const,
        books: (versionId: string) => ['bible', 'books', versionId] as const,
        chapter: (versionId: string, bookId: string, chapter: number) => 
            ['bible', 'chapter', versionId, bookId, chapter] as const,
    },
};
