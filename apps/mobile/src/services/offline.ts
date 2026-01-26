import { db } from '@/lib/database';
import { bibleService, BibleChapter } from '@/services/bible';
import { hymnalService, Hymn } from '@/services/hymnal';
import { manualService, ManualArticle } from '@/services/manual';

export interface DownloadProgress {
    current: number;
    total: number;
    type: string;
    name: string;
}

export interface DownloadMeta {
    id: string;
    type: 'bible' | 'hymnal' | 'manual';
    name: string;
    size: number;
    downloaded_at: string;
}

export const offlineService = {
    // ========== Bible ==========

    downloadBibleVersion: async (
        version: string,
        onProgress?: (progress: DownloadProgress) => void
    ): Promise<void> => {
        const books = await bibleService.getBooks(version);
        let current = 0;
        const total = books.reduce((acc, book) => acc + book.chapters_count, 0);

        for (const book of books) {
            for (let chapter = 1; chapter <= book.chapters_count; chapter++) {
                const data = await bibleService.getChapter(book.abbrev, chapter, version);

                await db.runAsync(
                    `INSERT OR REPLACE INTO bible_chapters (id, book, chapter, version, verses, downloaded_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [`${version}-${book.abbrev}-${chapter}`, book.abbrev, chapter, version, JSON.stringify(data.verses), new Date().toISOString()]
                );

                current++;
                onProgress?.({ current, total, type: 'bible', name: `${book.name} ${chapter}` });
            }
        }

        // Salvar metadados
        await db.runAsync(
            `INSERT OR REPLACE INTO downloads_meta (id, type, name, size, downloaded_at)
       VALUES (?, ?, ?, ?, ?)`,
            [`bible-${version}`, 'bible', version.toUpperCase(), total, new Date().toISOString()]
        );
    },

    getBibleChapterOffline: async (
        book: string,
        chapter: number,
        version: string
    ): Promise<BibleChapter | null> => {
        const result = await db.getFirstAsync<{ verses: string; book: string; chapter: number }>(
            `SELECT verses, book, chapter FROM bible_chapters WHERE id = ?`,
            [`${version}-${book}-${chapter}`]
        );

        if (!result) return null;

        return {
            book_abbrev: result.book,
            book_name: result.book,
            chapter: result.chapter,
            verses: JSON.parse(result.verses),
        };
    },

    // ========== Hymnal ==========

    downloadHymnal: async (
        onProgress?: (progress: DownloadProgress) => void
    ): Promise<void> => {
        const hymns = await hymnalService.getHymns();
        let current = 0;
        const total = hymns.length;

        for (const hymn of hymns) {
            const fullHymn = await hymnalService.getHymn(hymn.number);

            await db.runAsync(
                `INSERT OR REPLACE INTO hymns (id, number, title, author, lyrics, downloaded_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [hymn.number, hymn.number, hymn.title, hymn.author || '', JSON.stringify(fullHymn.lyrics), new Date().toISOString()]
            );

            current++;
            onProgress?.({ current, total, type: 'hymnal', name: `Hino ${hymn.number}` });
        }

        await db.runAsync(
            `INSERT OR REPLACE INTO downloads_meta (id, type, name, size, downloaded_at)
       VALUES (?, ?, ?, ?, ?)`,
            ['hymnal', 'hymnal', 'Novo Cântico', total, new Date().toISOString()]
        );
    },

    getHymnsOffline: async (): Promise<Hymn[]> => {
        const results = await db.getAllAsync<{ number: number; title: string; author: string; lyrics: string }>(
            `SELECT number, title, author, lyrics FROM hymns ORDER BY number`
        );

        return results.map(r => ({
            number: r.number,
            title: r.title,
            author: r.author,
            lyrics: JSON.parse(r.lyrics),
        }));
    },

    getHymnOffline: async (number: number): Promise<Hymn | null> => {
        const result = await db.getFirstAsync<{ number: number; title: string; author: string; lyrics: string }>(
            `SELECT number, title, author, lyrics FROM hymns WHERE number = ?`,
            [number]
        );

        if (!result) return null;

        return {
            number: result.number,
            title: result.title,
            author: result.author,
            lyrics: JSON.parse(result.lyrics),
        };
    },

    // ========== Manual ==========

    downloadManual: async (
        onProgress?: (progress: DownloadProgress) => void
    ): Promise<void> => {
        const structure = await manualService.getStructure();
        const articleIds: string[] = [];

        // Coletar todos os IDs de artigos
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
        const total = articleIds.length;

        for (const articleId of articleIds) {
            const article = await manualService.getArticle(articleId);

            await db.runAsync(
                `INSERT OR REPLACE INTO manual_articles (id, number, text, structure, notes, navigation, downloaded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    article.id,
                    article.number,
                    article.text,
                    JSON.stringify(article.structure),
                    JSON.stringify(article.notes),
                    JSON.stringify(article.navigation),
                    new Date().toISOString()
                ]
            );

            current++;
            onProgress?.({ current, total, type: 'manual', name: `Artigo ${article.number}` });
        }

        await db.runAsync(
            `INSERT OR REPLACE INTO downloads_meta (id, type, name, size, downloaded_at)
       VALUES (?, ?, ?, ?, ?)`,
            ['manual', 'manual', 'Manual IPB', total, new Date().toISOString()]
        );
    },

    getArticleOffline: async (articleId: string): Promise<ManualArticle | null> => {
        const result = await db.getFirstAsync<{
            id: string;
            number: string;
            text: string;
            structure: string;
            notes: string;
            navigation: string;
        }>(
            `SELECT * FROM manual_articles WHERE id = ?`,
            [articleId]
        );

        if (!result) return null;

        return {
            id: result.id,
            number: result.number,
            text: result.text,
            structure: JSON.parse(result.structure),
            notes: JSON.parse(result.notes),
            navigation: JSON.parse(result.navigation),
        };
    },

    // ========== Metadata ==========

    getDownloadedContent: async (): Promise<DownloadMeta[]> => {
        const results = await db.getAllAsync<DownloadMeta>(
            `SELECT id, type, name, size, downloaded_at FROM downloads_meta ORDER BY downloaded_at DESC`
        );
        return results;
    },

    deleteDownload: async (id: string): Promise<void> => {
        const meta = await db.getFirstAsync<{ type: string }>(
            `SELECT type FROM downloads_meta WHERE id = ?`,
            [id]
        );

        if (!meta) return;

        if (meta.type === 'bible') {
            const version = id.replace('bible-', '');
            await db.runAsync(`DELETE FROM bible_chapters WHERE version = ?`, [version]);
        } else if (meta.type === 'hymnal') {
            await db.runAsync(`DELETE FROM hymns`);
        } else if (meta.type === 'manual') {
            await db.runAsync(`DELETE FROM manual_articles`);
        }

        await db.runAsync(`DELETE FROM downloads_meta WHERE id = ?`, [id]);
    },

    isContentDownloaded: async (type: string, id?: string): Promise<boolean> => {
        const downloadId = id ? `${type}-${id}` : type;
        const result = await db.getFirstAsync<{ id: string }>(
            `SELECT id FROM downloads_meta WHERE id = ?`,
            [downloadId]
        );
        return !!result;
    },
};
