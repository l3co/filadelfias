import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            gcTime: 1000 * 60 * 30,   // 30 minutos (antigo cacheTime)
            retry: 2,
            refetchOnWindowFocus: false, // Mobile não tem "window focus"
        },
    },
});
