import { getDatabase } from "@/lib/database";
import { api } from "./api";

export interface BibleBook {
  abbrev: string;
  name: string;
  chapters_count: number;
  testament: "OT" | "NT" | "old" | "new";
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  book_abbrev: string;
  book_name: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleVersion {
  id: string;
  name: string;
  abbreviation?: string;
  description?: string;
  code?: string;
  language?: string;
}

function normalizeVersion(version: BibleVersion) {
  return {
    id: version.id,
    name: version.name,
    abbreviation: version.abbreviation || version.code || version.id,
    language: version.language || "pt-BR",
  };
}

function normalizeChapterResponse(data: BibleChapter | { verses: string[] }): BibleChapter {
  const chapterData = data as Partial<BibleChapter> & { verses: string[] | BibleVerse[] };
  const normalizedVerses = chapterData.verses.map((verse: string | BibleVerse, index: number) =>
    typeof verse === "string" ? { number: index + 1, text: verse } : verse,
  );

  return {
    book_abbrev: chapterData.book_abbrev || "",
    book_name: chapterData.book_name || chapterData.book_abbrev || "",
    chapter: chapterData.chapter || 1,
    verses: normalizedVerses,
  };
}

export interface BibleSearchResult {
  reference: string;
  book_abbrev: string;
  chapter: number;
  verse: number;
  text: string;
}

export const bibleService = {
  getVersions: async (): Promise<BibleVersion[]> => {
    const { data } = await api.get("/bible/versions");
    return data.map(normalizeVersion);
  },

  getBooks: async (version: string): Promise<BibleBook[]> => {
    const { data } = await api.get("/bible/books", { params: { version } });
    return data.map((book: BibleBook) => ({
      ...book,
      testament: book.testament === "old" ? "OT" : book.testament === "new" ? "NT" : book.testament,
    }));
  },

  getChapter: async (book: string, chapter: number, version: string): Promise<BibleChapter> => {
    const database = await getDatabase();
    const offline = await database.select<{ verses: string; book: string; chapter: number }[]>(
      "SELECT verses, book, chapter FROM bible_chapters WHERE id = ?",
      [`${version}-${book}-${chapter}`],
    );

    if (offline.length > 0) {
      return {
        book_abbrev: offline[0].book,
        book_name: offline[0].book,
        chapter: offline[0].chapter,
        verses: JSON.parse(offline[0].verses),
      };
    }

    const { data } = await api.get(`/bible/${book}/${chapter}`, { params: { version } });
    return normalizeChapterResponse(data);
  },

  search: async (query: string, version: string, testament?: "OT" | "NT"): Promise<{ results: BibleSearchResult[]; total: number }> => {
    const { data } = await api.get("/bible/search", {
      params: { q: query, version, testament, limit: 30 },
    });

    const rawResults = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
    const results = rawResults.map((r: Record<string, unknown>) => ({
      reference: String(r.reference ?? ""),
      book_abbrev: String(r.book_abbrev ?? r.book ?? ""),
      chapter: Number(r.chapter ?? 1),
      verse: Number(r.verse ?? r.number ?? 0),
      text: String(r.text ?? ""),
    }));

    return { results, total: Number(data?.total ?? results.length) };
  },
};
