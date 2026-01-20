import { api } from '@/lib/api';

export interface ManualMetadata {
    title: string;
    editionYear: number;
    language: string;
}

export interface ManualArticleSummary {
    id: string;
    number: string;
}

export interface ManualSection {
    id: string;
    number: string;
    title: string;
    articles: ManualArticleSummary[];
}

export interface ManualChapter {
    id: string;
    number: string;
    title: string;
    sections: ManualSection[];
    articles: ManualArticleSummary[];
}

export interface ManualPart {
    id: string;
    title: string;
    chapters: ManualChapter[];
}

export interface ManualStructure {
    metadata: ManualMetadata;
    parts: ManualPart[];
    total_articles: number;
}

export interface ArticleNote {
    id: string;
    number: string;
    marker?: string;
    text?: string;
    page?: number;
}

export interface ArticleStructure {
    id: string;
    type: string;
    marker?: string;
    text: string;
    notes?: ArticleNote[];
}

export interface ArticleNavigation {
    previous: { id: string; number: string } | null;
    next: { id: string; number: string } | null;
}

export interface ManualArticle {
    id: string;
    number: string;
    text: string;
    structure: ArticleStructure[];
    notes: ArticleNote[];
    navigation: ArticleNavigation;
}

export interface SearchResult {
    id: string;
    number: string;
    excerpt: string;
    chapter: string;
    section: string | null;
}

export interface SearchResponse {
    query: string;
    count: number;
    results: SearchResult[];
}

export const manualService = {
    getStructure: async (): Promise<ManualStructure> => {
        const response = await api.get('/manual/structure');
        return response.data;
    },

    getArticle: async (articleId: string): Promise<ManualArticle> => {
        const response = await api.get(`/manual/article/${articleId}`);
        return response.data;
    },

    search: async (query: string, limit: number = 20): Promise<SearchResponse> => {
        const response = await api.get('/manual/search', {
            params: { q: query, limit }
        });
        return response.data;
    }
};
