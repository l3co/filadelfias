import { api } from '../lib/api';

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
    getBooks: async (): Promise<BibleBook[]> => {
        const response = await api.get('/bible/books');
        return response.data;
    },
    getChapter: async (book: string, chapter: number): Promise<BibleChapter> => {
        const response = await api.get(`/bible/${book}/${chapter}`);
        return response.data;
    }
}
