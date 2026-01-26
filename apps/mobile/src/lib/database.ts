import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('filadelfias.db');

// Inicializa as tabelas do banco
export async function initDatabase() {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bible_chapters (
      id TEXT PRIMARY KEY,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      version TEXT NOT NULL,
      verses TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hymns (
      id INTEGER PRIMARY KEY,
      number INTEGER NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      lyrics TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS manual_articles (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      text TEXT NOT NULL,
      structure TEXT NOT NULL,
      notes TEXT,
      navigation TEXT,
      downloaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS downloads_meta (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      size INTEGER,
      downloaded_at TEXT NOT NULL
    );
  `);
}

export { db };
