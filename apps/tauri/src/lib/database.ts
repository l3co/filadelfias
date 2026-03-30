import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  db = await Database.load("sqlite:filadelfias.db");
  await migrate(db);
  return db;
}

async function migrate(database: Database): Promise<void> {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS bible_chapters (
      id TEXT PRIMARY KEY,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      version TEXT NOT NULL,
      verses TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS bible_verses_flat (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      version TEXT NOT NULL,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      verse_text TEXT NOT NULL
    )
  `);

  await database.execute(`
    CREATE VIRTUAL TABLE IF NOT EXISTS bible_fts
    USING fts5(verse_text, book, chapter, verse_number, version, content='bible_verses_flat')
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS hymns (
      id INTEGER PRIMARY KEY,
      number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      author TEXT,
      lyrics TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    )
  `);

  await database.execute(`
    CREATE VIRTUAL TABLE IF NOT EXISTS hymns_fts
    USING fts5(title, author, lyrics, content='hymns', content_rowid='id')
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS manual_articles (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      text TEXT NOT NULL,
      structure TEXT NOT NULL,
      notes TEXT NOT NULL,
      navigation TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS downloads_meta (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      downloaded_at TEXT NOT NULL
    )
  `);
}
