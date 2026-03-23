import { api } from '@/services/api';

export interface BibleVersion {
    id: string;
    name: string;
    description: string;
    code?: string;
    is_remote?: boolean;
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
    title?: string;
    verses: string[];
    previous_chapter?: { book: string; chapter: number };
    next_chapter?: { book: string; chapter: number };
}

export interface BibleSearchResult {
    book: string;
    book_abbrev: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
}

export interface BibleSearchResponse {
    results: BibleSearchResult[];
    total: number;
    query: string;
    version: string;
}

export interface BibleNote {
    id: string;
    version_code: string;
    book_abbrev: string;
    chapter: number;
    verse: number;
    content: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface BibleHighlight {
    id: string;
    version_code: string;
    book_abbrev: string;
    chapter: number;
    verse: number;
    color?: string;
    category?: string;
    created_at: string;
}

export interface ReadingPlanDay {
    day: number;
    title?: string;
    references: string[];
}

export interface ReadingPlan {
    id: string;
    name: string;
    description?: string;
    duration_days: number;
    readings: ReadingPlanDay[];
    is_public: boolean;
    created_at: string;
}

export interface ReadingPlanProgress {
    id: string;
    plan_id: string;
    current_day: number;
    completed_readings: number[];
    started_at: string;
    completed_at?: string | null;
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
    },
    searchVerses: async (params: {
        query: string;
        version?: string;
        testament?: 'OT' | 'NT';
        limit?: number;
        offset?: number;
    }): Promise<BibleSearchResponse> => {
        const response = await api.get('/bible/search', {
            params: {
                q: params.query,
                version: params.version,
                testament: params.testament,
                limit: params.limit,
                offset: params.offset,
            }
        });
        return response.data;
    },
    getNotes: async (
        tenantId: string,
        filters?: { version?: string; book?: string; chapter?: number }
    ): Promise<BibleNote[]> => {
        const response = await api.get('/bible/notes', {
            params: {
                tenant_id: tenantId,
                version: filters?.version,
                book: filters?.book,
                chapter: filters?.chapter,
            }
        });
        return response.data;
    },
    createNote: async (payload: {
        tenant_id: string;
        version_code: string;
        book_abbrev: string;
        chapter: number;
        verse: number;
        content: string;
        is_public?: boolean;
    }): Promise<BibleNote> => {
        const response = await api.post('/bible/notes', payload);
        return response.data;
    },
    updateNote: async (id: string, content: string): Promise<BibleNote> => {
        const response = await api.put(`/bible/notes/${id}`, { content });
        return response.data;
    },
    deleteNote: async (id: string): Promise<void> => {
        await api.delete(`/bible/notes/${id}`);
    },
    getHighlights: async (
        tenantId: string,
        filters?: { version?: string; book?: string; chapter?: number }
    ): Promise<BibleHighlight[]> => {
        const response = await api.get('/bible/highlights', {
            params: {
                tenant_id: tenantId,
                version: filters?.version,
                book: filters?.book,
                chapter: filters?.chapter,
            }
        });
        return response.data;
    },
    createHighlight: async (payload: {
        tenant_id: string;
        version_code: string;
        book_abbrev: string;
        chapter: number;
        verse: number;
        color?: string;
        category?: string;
    }): Promise<BibleHighlight> => {
        const response = await api.post('/bible/highlights', payload);
        return response.data;
    },
    deleteHighlight: async (id: string): Promise<void> => {
        await api.delete(`/bible/highlights/${id}`);
    },
    getReadingPlans: async (tenantId: string): Promise<ReadingPlan[]> => {
        const response = await api.get('/bible/reading-plans', {
            params: { tenant_id: tenantId },
        });
        return response.data;
    },
    getReadingPlan: async (planId: string): Promise<ReadingPlan> => {
        const response = await api.get(`/bible/reading-plans/${planId}`);
        return response.data;
    },
    startReadingPlan: async (planId: string): Promise<ReadingPlanProgress> => {
        const response = await api.post(`/bible/reading-plans/${planId}/start`);
        return response.data;
    },
    getReadingPlanProgress: async (planId: string): Promise<ReadingPlanProgress> => {
        const response = await api.get(`/bible/reading-plans/${planId}/progress`);
        return response.data;
    },
    markReadingPlanDay: async (planId: string, day: number): Promise<ReadingPlanProgress> => {
        const response = await api.post(`/bible/reading-plans/${planId}/progress`, { day });
        return response.data;
    },
}
