import { api } from '../lib/api';

export interface Hymn {
    number: number;
    title: string;
    author: string;
    lyrics: string[];
}

const isHymn = (value: unknown): value is Hymn => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const hymn = value as Partial<Hymn>;
    return (
        typeof hymn.number === 'number' &&
        typeof hymn.title === 'string' &&
        Array.isArray(hymn.lyrics)
    );
};

const normalizeHymnsResponse = (payload: unknown): Hymn[] => {
    if (Array.isArray(payload)) {
        return payload.filter(isHymn);
    }

    if (payload && typeof payload === 'object') {
        const maybeItems = (payload as { items?: unknown }).items;
        if (Array.isArray(maybeItems)) {
            return maybeItems.filter(isHymn);
        }
    }

    return [];
};

export const hymnalService = {
    getHymns: async (): Promise<Hymn[]> => {
        const response = await api.get('/hymnal/');
        return normalizeHymnsResponse(response.data);
    },
    getHymn: async (number: number): Promise<Hymn> => {
        const response = await api.get(`/hymnal/${number}`);
        return response.data;
    }
}
