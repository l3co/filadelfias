# 📴 Fase 5: Funcionalidade Offline

## Objetivo
Permitir download e leitura offline da Bíblia, Hinário e Manual IPB.

---

## Arquitetura de Storage

```
┌─────────────────────────────────────────────────────────┐
│                    Offline Storage                       │
├─────────────────────────────────────────────────────────┤
│  MMKV (react-native-mmkv)                               │
│  └── Configs, preferências, estado de downloads         │
├─────────────────────────────────────────────────────────┤
│  SQLite (expo-sqlite)                                   │
│  └── Bíblia, Hinário, Manual (dados estruturados)       │
├─────────────────────────────────────────────────────────┤
│  FileSystem (expo-file-system)                          │
│  └── Arquivos JSON originais (backup)                   │
└─────────────────────────────────────────────────────────┘
```

---

## Conteúdo Disponível para Download

| Conteúdo | Arquivo Backend | Tamanho Aprox. |
|----------|-----------------|----------------|
| Bíblia AA | `bible_aa.json` | ~4 MB |
| Bíblia ACF | `bible_acf.json` | ~4 MB |
| Bíblia NVI | `bible_nvi.json` | ~4 MB |
| Hinário NC | `hymnal_nc.json` | ~500 KB |
| Manual IPB 2019 | `manual_2019.json` | ~1 MB |

---

## Database Schema (SQLite)

```typescript
// src/lib/database.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('filadelfias.db');

export async function initDatabase() {
  await db.execAsync(`
    -- Tabela de versões da Bíblia baixadas
    CREATE TABLE IF NOT EXISTS bible_versions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    );

    -- Tabela de livros da Bíblia
    CREATE TABLE IF NOT EXISTS bible_books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_id TEXT NOT NULL,
      abbrev TEXT NOT NULL,
      name TEXT NOT NULL,
      chapters_count INTEGER NOT NULL,
      testament TEXT NOT NULL,
      FOREIGN KEY (version_id) REFERENCES bible_versions(id)
    );

    -- Tabela de versículos
    CREATE TABLE IF NOT EXISTS bible_verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_id TEXT NOT NULL,
      book_abbrev TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (version_id) REFERENCES bible_versions(id)
    );

    -- Índices para busca rápida
    CREATE INDEX IF NOT EXISTS idx_verses_lookup 
      ON bible_verses(version_id, book_abbrev, chapter);

    -- Tabela de hinos
    CREATE TABLE IF NOT EXISTS hymns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      author TEXT,
      lyrics TEXT NOT NULL
    );

    -- Tabela de artigos do manual
    CREATE TABLE IF NOT EXISTS manual_articles (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      text TEXT NOT NULL,
      structure TEXT NOT NULL,
      notes TEXT
    );

    -- Metadados de download
    CREATE TABLE IF NOT EXISTS download_metadata (
      content_type TEXT PRIMARY KEY,
      version TEXT,
      downloaded_at TEXT NOT NULL,
      size_bytes INTEGER
    );
  `);
}

export { db };
```

---

## Store de Offline

```typescript
// src/stores/offlineStore.ts
import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import * as FileSystem from 'expo-file-system';
import { db, initDatabase } from '@/lib/database';
import { api } from '@/services/api';

const storage = new MMKV();

interface DownloadProgress {
  contentType: string;
  progress: number; // 0-100
  status: 'idle' | 'downloading' | 'processing' | 'done' | 'error';
}

interface OfflineState {
  // Estado
  isInitialized: boolean;
  downloadedBibles: string[];
  hasHymnal: boolean;
  hasManual: boolean;
  currentDownload: DownloadProgress | null;
  
  // Ações
  initialize: () => Promise<void>;
  downloadBible: (version: string) => Promise<void>;
  downloadHymnal: () => Promise<void>;
  downloadManual: () => Promise<void>;
  deleteBible: (version: string) => Promise<void>;
  deleteHymnal: () => Promise<void>;
  deleteManual: () => Promise<void>;
  
  // Leitura offline
  getBibleChapterOffline: (version: string, book: string, chapter: number) => Promise<any>;
  getHymnOffline: (number: number) => Promise<any>;
  getManualArticleOffline: (articleId: string) => Promise<any>;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isInitialized: false,
  downloadedBibles: [],
  hasHymnal: false,
  hasManual: false,
  currentDownload: null,

  initialize: async () => {
    try {
      await initDatabase();
      
      // Carregar estado salvo
      const savedBibles = storage.getString('downloaded_bibles');
      const hasHymnal = storage.getBoolean('has_hymnal') ?? false;
      const hasManual = storage.getBoolean('has_manual') ?? false;

      set({
        isInitialized: true,
        downloadedBibles: savedBibles ? JSON.parse(savedBibles) : [],
        hasHymnal,
        hasManual,
      });
    } catch (error) {
      console.error('Failed to initialize offline store:', error);
    }
  },

  downloadBible: async (version: string) => {
    const { downloadedBibles } = get();
    if (downloadedBibles.includes(version)) return;

    try {
      set({ currentDownload: { contentType: `bible_${version}`, progress: 0, status: 'downloading' } });

      // Baixar JSON da API
      const response = await api.get(`/bible/download/${version}`, {
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          set({ currentDownload: { contentType: `bible_${version}`, progress, status: 'downloading' } });
        },
      });

      set({ currentDownload: { contentType: `bible_${version}`, progress: 100, status: 'processing' } });

      const bibleData = response.data;

      // Inserir no SQLite
      await db.withTransactionAsync(async () => {
        // Inserir versão
        await db.runAsync(
          'INSERT OR REPLACE INTO bible_versions (id, name, downloaded_at) VALUES (?, ?, ?)',
          [version, bibleData.name, new Date().toISOString()]
        );

        // Inserir livros
        for (const book of bibleData.books) {
          await db.runAsync(
            'INSERT INTO bible_books (version_id, abbrev, name, chapters_count, testament) VALUES (?, ?, ?, ?, ?)',
            [version, book.abbrev, book.name, book.chapters.length, book.testament]
          );

          // Inserir versículos
          for (let chapterIdx = 0; chapterIdx < book.chapters.length; chapterIdx++) {
            const verses = book.chapters[chapterIdx];
            for (let verseIdx = 0; verseIdx < verses.length; verseIdx++) {
              await db.runAsync(
                'INSERT INTO bible_verses (version_id, book_abbrev, chapter, verse_number, text) VALUES (?, ?, ?, ?, ?)',
                [version, book.abbrev, chapterIdx + 1, verseIdx + 1, verses[verseIdx]]
              );
            }
          }
        }
      });

      // Atualizar estado
      const newBibles = [...downloadedBibles, version];
      storage.set('downloaded_bibles', JSON.stringify(newBibles));
      
      set({ 
        downloadedBibles: newBibles,
        currentDownload: { contentType: `bible_${version}`, progress: 100, status: 'done' } 
      });

      setTimeout(() => set({ currentDownload: null }), 2000);
    } catch (error) {
      console.error('Failed to download bible:', error);
      set({ currentDownload: { contentType: `bible_${version}`, progress: 0, status: 'error' } });
    }
  },

  downloadHymnal: async () => {
    try {
      set({ currentDownload: { contentType: 'hymnal', progress: 0, status: 'downloading' } });

      const response = await api.get('/hymnal/download');
      const hymns = response.data;

      set({ currentDownload: { contentType: 'hymnal', progress: 50, status: 'processing' } });

      await db.withTransactionAsync(async () => {
        for (const hymn of hymns) {
          await db.runAsync(
            'INSERT OR REPLACE INTO hymns (number, title, author, lyrics) VALUES (?, ?, ?, ?)',
            [hymn.number, hymn.title, hymn.author, JSON.stringify(hymn.lyrics)]
          );
        }
      });

      storage.set('has_hymnal', true);
      set({ 
        hasHymnal: true,
        currentDownload: { contentType: 'hymnal', progress: 100, status: 'done' } 
      });

      setTimeout(() => set({ currentDownload: null }), 2000);
    } catch (error) {
      console.error('Failed to download hymnal:', error);
      set({ currentDownload: { contentType: 'hymnal', progress: 0, status: 'error' } });
    }
  },

  downloadManual: async () => {
    try {
      set({ currentDownload: { contentType: 'manual', progress: 0, status: 'downloading' } });

      const response = await api.get('/manual/download');
      const manual = response.data;

      set({ currentDownload: { contentType: 'manual', progress: 50, status: 'processing' } });

      await db.withTransactionAsync(async () => {
        for (const article of manual.articles) {
          await db.runAsync(
            'INSERT OR REPLACE INTO manual_articles (id, number, text, structure, notes) VALUES (?, ?, ?, ?, ?)',
            [article.id, article.number, article.text, JSON.stringify(article.structure), JSON.stringify(article.notes)]
          );
        }
      });

      storage.set('has_manual', true);
      set({ 
        hasManual: true,
        currentDownload: { contentType: 'manual', progress: 100, status: 'done' } 
      });

      setTimeout(() => set({ currentDownload: null }), 2000);
    } catch (error) {
      console.error('Failed to download manual:', error);
      set({ currentDownload: { contentType: 'manual', progress: 0, status: 'error' } });
    }
  },

  deleteBible: async (version: string) => {
    await db.runAsync('DELETE FROM bible_verses WHERE version_id = ?', [version]);
    await db.runAsync('DELETE FROM bible_books WHERE version_id = ?', [version]);
    await db.runAsync('DELETE FROM bible_versions WHERE id = ?', [version]);

    const { downloadedBibles } = get();
    const newBibles = downloadedBibles.filter(v => v !== version);
    storage.set('downloaded_bibles', JSON.stringify(newBibles));
    set({ downloadedBibles: newBibles });
  },

  deleteHymnal: async () => {
    await db.runAsync('DELETE FROM hymns');
    storage.set('has_hymnal', false);
    set({ hasHymnal: false });
  },

  deleteManual: async () => {
    await db.runAsync('DELETE FROM manual_articles');
    storage.set('has_manual', false);
    set({ hasManual: false });
  },

  getBibleChapterOffline: async (version, book, chapter) => {
    const verses = await db.getAllAsync(
      'SELECT verse_number, text FROM bible_verses WHERE version_id = ? AND book_abbrev = ? AND chapter = ? ORDER BY verse_number',
      [version, book, chapter]
    );

    const bookInfo = await db.getFirstAsync(
      'SELECT name FROM bible_books WHERE version_id = ? AND abbrev = ?',
      [version, book]
    );

    return {
      book_name: bookInfo?.name || book,
      book_abbrev: book,
      chapter,
      verses: verses.map(v => v.text),
    };
  },

  getHymnOffline: async (number) => {
    const hymn = await db.getFirstAsync(
      'SELECT * FROM hymns WHERE number = ?',
      [number]
    );

    if (hymn) {
      return {
        ...hymn,
        lyrics: JSON.parse(hymn.lyrics),
      };
    }
    return null;
  },

  getManualArticleOffline: async (articleId) => {
    const article = await db.getFirstAsync(
      'SELECT * FROM manual_articles WHERE id = ?',
      [articleId]
    );

    if (article) {
      return {
        ...article,
        structure: JSON.parse(article.structure),
        notes: JSON.parse(article.notes || '[]'),
      };
    }
    return null;
  },
}));
```

---

## Tela de Downloads

```tsx
// app/(public)/downloads.tsx
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useEffect } from 'react';
import { 
  BookOpen, Music, BookMarked, Download, 
  Trash2, Check, Loader2, AlertCircle 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useOfflineStore } from '@/stores/offlineStore';
import { colors } from '@/constants/colors';

const BIBLE_VERSIONS = [
  { id: 'nvi', name: 'Nova Versão Internacional', size: '~4 MB' },
  { id: 'acf', name: 'Almeida Corrigida Fiel', size: '~4 MB' },
  { id: 'aa', name: 'Almeida Atualizada', size: '~4 MB' },
];

export default function DownloadsScreen() {
  const insets = useSafeAreaInsets();
  const {
    isInitialized,
    initialize,
    downloadedBibles,
    hasHymnal,
    hasManual,
    currentDownload,
    downloadBible,
    downloadHymnal,
    downloadManual,
    deleteBible,
    deleteHymnal,
    deleteManual,
  } = useOfflineStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, []);

  const handleDelete = (type: string, version?: string) => {
    Alert.alert(
      'Remover conteúdo',
      'Tem certeza que deseja remover este conteúdo offline?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            if (type === 'bible' && version) {
              await deleteBible(version);
            } else if (type === 'hymnal') {
              await deleteHymnal();
            } else if (type === 'manual') {
              await deleteManual();
            }
          },
        },
      ]
    );
  };

  const renderDownloadStatus = (contentType: string) => {
    if (currentDownload?.contentType === contentType) {
      if (currentDownload.status === 'downloading' || currentDownload.status === 'processing') {
        return (
          <View className="flex-row items-center">
            <Loader2 size={18} color={colors.primary[600]} className="animate-spin" />
            <Text className="text-sm text-emerald-600 ml-2">
              {currentDownload.progress}%
            </Text>
          </View>
        );
      }
      if (currentDownload.status === 'error') {
        return <AlertCircle size={18} color={colors.error} />;
      }
    }
    return null;
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Conteúdo Offline" showBack />

      <ScrollView 
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Info */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100">
          <Text className="text-blue-800 font-medium">📱 Leitura Offline</Text>
          <Text className="text-blue-700 text-sm mt-1">
            Baixe o conteúdo para ler mesmo sem conexão com a internet.
          </Text>
        </View>

        {/* Bíblia */}
        <Text className="font-semibold text-slate-700 mb-3">Bíblia Sagrada</Text>
        {BIBLE_VERSIONS.map((version) => {
          const isDownloaded = downloadedBibles.includes(version.id);
          const isDownloading = currentDownload?.contentType === `bible_${version.id}`;

          return (
            <View 
              key={version.id}
              className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
            >
              <View className="flex-row items-center">
                <View className="h-12 w-12 rounded-xl bg-blue-50 items-center justify-center">
                  <BookOpen size={24} color={colors.info} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-slate-900">{version.name}</Text>
                  <Text className="text-sm text-slate-400">{version.size}</Text>
                </View>
                
                {renderDownloadStatus(`bible_${version.id}`)}
                
                {isDownloaded ? (
                  <View className="flex-row items-center">
                    <Check size={18} color={colors.success} />
                    <Pressable
                      onPress={() => handleDelete('bible', version.id)}
                      className="ml-3 p-2"
                    >
                      <Trash2 size={18} color={colors.slate[400]} />
                    </Pressable>
                  </View>
                ) : !isDownloading ? (
                  <Pressable
                    onPress={() => downloadBible(version.id)}
                    className="p-2 bg-emerald-50 rounded-lg"
                  >
                    <Download size={18} color={colors.primary[600]} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}

        {/* Hinário */}
        <Text className="font-semibold text-slate-700 mt-6 mb-3">Hinário</Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-100">
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-xl bg-purple-50 items-center justify-center">
              <Music size={24} color={colors.purple[600]} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-medium text-slate-900">Novo Cântico</Text>
              <Text className="text-sm text-slate-400">~500 KB</Text>
            </View>
            
            {renderDownloadStatus('hymnal')}
            
            {hasHymnal ? (
              <View className="flex-row items-center">
                <Check size={18} color={colors.success} />
                <Pressable
                  onPress={() => handleDelete('hymnal')}
                  className="ml-3 p-2"
                >
                  <Trash2 size={18} color={colors.slate[400]} />
                </Pressable>
              </View>
            ) : currentDownload?.contentType !== 'hymnal' ? (
              <Pressable
                onPress={downloadHymnal}
                className="p-2 bg-emerald-50 rounded-lg"
              >
                <Download size={18} color={colors.primary[600]} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Manual */}
        <Text className="font-semibold text-slate-700 mt-6 mb-3">Manual IPB</Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-100">
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-xl bg-emerald-50 items-center justify-center">
              <BookMarked size={24} color={colors.primary[600]} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-medium text-slate-900">Edição 2019</Text>
              <Text className="text-sm text-slate-400">~1 MB</Text>
            </View>
            
            {renderDownloadStatus('manual')}
            
            {hasManual ? (
              <View className="flex-row items-center">
                <Check size={18} color={colors.success} />
                <Pressable
                  onPress={() => handleDelete('manual')}
                  className="ml-3 p-2"
                >
                  <Trash2 size={18} color={colors.slate[400]} />
                </Pressable>
              </View>
            ) : currentDownload?.contentType !== 'manual' ? (
              <Pressable
                onPress={downloadManual}
                className="p-2 bg-emerald-50 rounded-lg"
              >
                <Download size={18} color={colors.primary[600]} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Botão baixar tudo */}
        {(!downloadedBibles.length || !hasHymnal || !hasManual) && (
          <Button
            onPress={async () => {
              for (const v of BIBLE_VERSIONS) {
                if (!downloadedBibles.includes(v.id)) {
                  await downloadBible(v.id);
                }
              }
              if (!hasHymnal) await downloadHymnal();
              if (!hasManual) await downloadManual();
            }}
            className="mt-6"
            icon={<Download size={20} color="white" />}
          >
            Baixar Todo Conteúdo
          </Button>
        )}
      </ScrollView>
    </View>
  );
}
```

---

## Hook de Leitura com Fallback Offline

```typescript
// src/hooks/useBibleChapter.ts
import { useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { bibleService } from '@/services/bible';
import { useOfflineStore } from '@/stores/offlineStore';

export function useBibleChapter(book: string, chapter: number, version: string) {
  const { downloadedBibles, getBibleChapterOffline } = useOfflineStore();
  const hasOffline = downloadedBibles.includes(version);

  return useQuery({
    queryKey: ['bible', 'chapter', book, chapter, version],
    queryFn: async () => {
      // Verificar conexão
      const netInfo = await NetInfo.fetch();
      
      if (netInfo.isConnected) {
        try {
          // Tentar buscar online
          return await bibleService.getChapter(book, chapter, version);
        } catch (error) {
          // Se falhar e tiver offline, usar offline
          if (hasOffline) {
            return await getBibleChapterOffline(version, book, chapter);
          }
          throw error;
        }
      } else if (hasOffline) {
        // Sem conexão, usar offline
        return await getBibleChapterOffline(version, book, chapter);
      } else {
        throw new Error('Sem conexão e conteúdo não disponível offline');
      }
    },
  });
}
```

---

## Endpoints Necessários no Backend

Adicionar endpoints de download que retornam o JSON completo:

```python
# apps/backend/src/api/bible.py

@router.get("/download/{version}")
async def download_bible(version: str):
    """Download complete bible for offline use."""
    return await BibleService.get_full_bible(version)

# apps/backend/src/api/hymnal.py

@router.get("/download")
async def download_hymnal():
    """Download complete hymnal for offline use."""
    return await HymnalService.get_all_hymns()

# apps/backend/src/api/manual.py

@router.get("/download")
async def download_manual():
    """Download complete manual for offline use."""
    return await ManualService.get_all_articles()
```

---

## Próximos Passos

1. → [09-FASE6-NOTIFICACOES.md](./09-FASE6-NOTIFICACOES.md) - Push Notifications
