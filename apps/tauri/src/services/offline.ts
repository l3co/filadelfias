import { getDatabase } from "@/lib/database";
import { bibleService } from "./bible";
import { hymnalService } from "./hymnal";
import { manualService } from "./manual";

export interface DownloadProgress {
  current: number;
  total: number;
  type: string;
  name: string;
}

export interface DownloadMeta {
  id: string;
  type: "bible" | "hymnal" | "manual";
  name: string;
  size: number;
  downloaded_at: string;
}

export const offlineService = {
  downloadBibleVersion: async (
    version: string,
    onProgress?: (progress: DownloadProgress) => void,
  ): Promise<void> => {
    const database = await getDatabase();
    const books = await bibleService.getBooks(version);
    let current = 0;
    const total = books.reduce((sum, book) => sum + book.chapters_count, 0);

    for (const book of books) {
      for (let chapter = 1; chapter <= book.chapters_count; chapter += 1) {
        const data = await bibleService.getChapter(book.abbrev, chapter, version);
        const chapterId = `${version}-${book.abbrev}-${chapter}`;
        const now = new Date().toISOString();

        await database.execute(
          `INSERT OR REPLACE INTO bible_chapters (id, book, chapter, version, verses, downloaded_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [chapterId, book.abbrev, chapter, version, JSON.stringify(data.verses), now],
        );

        await database.execute("DELETE FROM bible_verses_flat WHERE chapter_id = ?", [chapterId]);

        for (const verse of data.verses) {
          await database.execute(
            `INSERT OR REPLACE INTO bible_verses_flat
             (id, chapter_id, version, book, chapter, verse_number, verse_text)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [`${chapterId}-${verse.number}`, chapterId, version, book.abbrev, chapter, verse.number, verse.text],
          );
        }

        current += 1;
        onProgress?.({ current, total, type: "bible", name: `${book.name} ${chapter}` });
      }
    }

    await database.execute(
      `INSERT OR REPLACE INTO downloads_meta (id, type, name, size, downloaded_at)
       VALUES (?, ?, ?, ?, ?)`,
      [`bible-${version}`, "bible", version.toUpperCase(), total, new Date().toISOString()],
    );
  },

  downloadHymnal: async (onProgress?: (progress: DownloadProgress) => void): Promise<void> => {
    const database = await getDatabase();
    const hymns = await hymnalService.getHymns();
    let current = 0;

    for (const hymn of hymns) {
      const full = await hymnalService.getHymn(hymn.number);
      await database.execute(
        `INSERT OR REPLACE INTO hymns (id, number, title, author, lyrics, downloaded_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          hymn.number,
          hymn.number,
          hymn.title,
          hymn.author || "",
          JSON.stringify(full.lyrics),
          new Date().toISOString(),
        ],
      );

      current += 1;
      onProgress?.({ current, total: hymns.length, type: "hymnal", name: `Hino ${hymn.number}` });
    }

    await database.execute(
      `INSERT OR REPLACE INTO downloads_meta (id, type, name, size, downloaded_at)
       VALUES (?, ?, ?, ?, ?)`,
      ["hymnal", "hymnal", "Novo Cantico", hymns.length, new Date().toISOString()],
    );
  },

  downloadManual: async (onProgress?: (progress: DownloadProgress) => void): Promise<void> => {
    const database = await getDatabase();
    const structure = await manualService.getStructure();
    const articleIds: string[] = [];

    for (const part of structure.parts) {
      for (const chapter of part.chapters) {
        for (const article of chapter.articles) {
          articleIds.push(article.id);
        }

        for (const section of chapter.sections) {
          for (const article of section.articles) {
            articleIds.push(article.id);
          }
        }
      }
    }

    let current = 0;
    const uniqueArticleIds = [...new Set(articleIds)];

    for (const articleId of uniqueArticleIds) {
      const article = await manualService.getArticle(articleId);
      await database.execute(
        `INSERT OR REPLACE INTO manual_articles (id, number, text, structure, notes, navigation, downloaded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          article.id,
          article.number,
          article.text,
          JSON.stringify(article.structure),
          JSON.stringify(article.notes),
          JSON.stringify(article.navigation),
          new Date().toISOString(),
        ],
      );

      current += 1;
      onProgress?.({ current, total: uniqueArticleIds.length, type: "manual", name: `Artigo ${article.number}` });
    }

    await database.execute(
      `INSERT OR REPLACE INTO downloads_meta (id, type, name, size, downloaded_at)
       VALUES (?, ?, ?, ?, ?)`,
      ["manual", "manual", "Manual IPB", uniqueArticleIds.length, new Date().toISOString()],
    );
  },

  getDownloadedContent: async (): Promise<DownloadMeta[]> => {
    const database = await getDatabase();
    return database.select<DownloadMeta[]>(
      "SELECT id, type, name, size, downloaded_at FROM downloads_meta ORDER BY downloaded_at DESC",
    );
  },

  isContentDownloaded: async (type: string, id?: string): Promise<boolean> => {
    const database = await getDatabase();
    const downloadId = id ? `${type}-${id}` : type;
    const result = await database.select<{ id: string }[]>("SELECT id FROM downloads_meta WHERE id = ?", [
      downloadId,
    ]);
    return result.length > 0;
  },

  deleteDownload: async (id: string): Promise<void> => {
    const database = await getDatabase();
    const meta = await database.select<{ type: string }[]>("SELECT type FROM downloads_meta WHERE id = ?", [id]);

    if (!meta.length) {
      return;
    }

    if (meta[0].type === "bible") {
      const version = id.replace("bible-", "");
      const chapterIds = await database.select<{ id: string }[]>(
        "SELECT id FROM bible_chapters WHERE version = ?",
        [version],
      );
      await database.execute("DELETE FROM bible_chapters WHERE version = ?", [version]);

      for (const chapter of chapterIds) {
        await database.execute("DELETE FROM bible_verses_flat WHERE chapter_id = ?", [chapter.id]);
      }
    } else if (meta[0].type === "hymnal") {
      await database.execute("DELETE FROM hymns");
    } else if (meta[0].type === "manual") {
      await database.execute("DELETE FROM manual_articles");
    }

    await database.execute("DELETE FROM downloads_meta WHERE id = ?", [id]);
  },
};
