import { api } from '@/services/api';

export interface Hymn {
    number: number;
    title: string;
    author: string;
    lyrics: string[];
}

export const hymnalService = {
    getHymns: async (): Promise<Hymn[]> => {
        const response = await api.get('/hymnal/');
        return response.data;
    },
    getHymn: async (number: number): Promise<Hymn> => {
        const response = await api.get(`/hymnal/${number}`);
        return response.data;
    }
}
