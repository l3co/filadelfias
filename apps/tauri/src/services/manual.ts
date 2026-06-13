import { getDatabase } from "@/lib/database";
import { api } from "./api";

export interface ManualMetadata {
  title: string;
  editionYear: number;
  language: string;
}

export interface ManualArticleSummary {
  id: string;
  number: string;
  excerpt?: string;
}

export interface ArticleContext {
  part_title: string;
  chapter_title: string;
  section_title: string | null;
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
  context: ArticleContext;
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
    const { data } = await api.get("/manual/structure");
    return data;
  },

  getArticle: async (articleId: string): Promise<ManualArticle> => {
    const database = await getDatabase();
    const offline = await database.select<
      {
        id: string;
        number: string;
        text: string;
        structure: string;
        notes: string;
        navigation: string;
        context: string;
      }[]
    >("SELECT * FROM manual_articles WHERE id = ?", [articleId]);

    if (offline.length > 0) {
      return {
        id: offline[0].id,
        number: offline[0].number,
        text: offline[0].text,
        structure: JSON.parse(offline[0].structure),
        notes: JSON.parse(offline[0].notes),
        navigation: JSON.parse(offline[0].navigation),
        context: JSON.parse(offline[0].context),
      };
    }

    const { data } = await api.get(`/manual/article/${articleId}`);
    return data;
  },

  search: async (query: string, limit = 20): Promise<SearchResponse> => {
    const { data } = await api.get("/manual/search", {
      params: { q: query, limit },
    });
    return data;
  },
};
