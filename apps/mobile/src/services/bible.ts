import { api } from '@/services/api';

export interface BibleVersion {
    id: string;
    name: string;
    description: string;
}

export interface BibleBook {
    abbrev: string;
    name: string;
    chapters_count: number;
    testament: 'old' | 'new';
}

export interface BibleChapter {
    book_abbrev: string;
    book_name: string;
    chapter: number;
    verses: string[];
    previous_chapter?: { book: string; chapter: number };
    next_chapter?: { book: string; chapter: number };
}

export const bibleService = {
    getVersions: async (): Promise<BibleVersion[]> => {
        const response = await api.get('/bible/versions');
        return response.data;
    },
    getBooks: async (version?: string): Promise<BibleBook[]> => {
        const response = await api.get('/bible/books', { params: { version } });
        return response.data;
    },
    getChapter: async (book: string, chapter: number, version?: string): Promise<BibleChapter> => {
        const response = await api.get(`/bible/${book}/${chapter}`, { params: { version } });
        return response.data;
    }
}
