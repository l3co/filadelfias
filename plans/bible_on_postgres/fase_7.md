# Fase 7 — Frontend Mobile

Interface otimizada para leitura bíblica em React Native com suporte offline.

---

## 🎯 Objetivo

Criar experiência mobile nativa com:
- Leitor otimizado para toque
- Busca rápida com autocomplete
- Anotações com rich text
- Destaques por toque longo
- Sincronização offline (AsyncStorage)
- Planos de leitura com notificações
- Performance otimizada

---

## 📱 Frontend Mobile — Componentes

### 1. Hook Customizado: `useBible`

**Arquivo:** `apps/mobile/src/hooks/useBible.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';

// Types (mesmos do web)
export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  book_abbrev: string;
  book_name: string;
  chapter: number;
  title?: string;
  verses: BibleVerse[];
  previous_chapter?: { book: string; chapter: number };
  next_chapter?: { book: string; chapter: number };
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

const CACHE_PREFIX = '@bible:';

export function useBible() {
  const queryClient = useQueryClient();

  // Função helper para cache offline
  const getCachedData = async <T,>(key: string): Promise<T | null> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const setCachedData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Cache error:', error);
    }
  };

  // Versões
  const useVersions = () =>
    useQuery({
      queryKey: ['bible', 'versions'],
      queryFn: async () => {
        try {
          const response = await api.get('/bible/versions');
          await setCachedData('versions', response.data);
          return response.data;
        } catch (error) {
          // Fallback para cache offline
          const cached = await getCachedData('versions');
          if (cached) return cached;
          throw error;
        }
      },
      staleTime: 1000 * 60 * 60 * 24, // 24h
    });

  // Livros
  const useBooks = (version: string = 'nvi') =>
    useQuery({
      queryKey: ['bible', 'books', version],
      queryFn: async () => {
        try {
          const response = await api.get(`/bible/books?version=${version}`);
          await setCachedData(`books:${version}`, response.data);
          return response.data;
        } catch (error) {
          const cached = await getCachedData(`books:${version}`);
          if (cached) return cached;
          throw error;
        }
      },
      staleTime: 1000 * 60 * 60 * 24, // 24h
    });

  // Capítulo com cache offline
  const useChapter = (book: string, chapter: number, version: string = 'nvi') =>
    useQuery<BibleChapter>({
      queryKey: ['bible', 'chapter', version, book, chapter],
      queryFn: async () => {
        const cacheKey = `chapter:${version}:${book}:${chapter}`;
        
        try {
          const response = await api.get(`/bible/${book}/${chapter}?version=${version}`);
          await setCachedData(cacheKey, response.data);
          return response.data;
        } catch (error) {
          // Fallback para cache
          const cached = await getCachedData<BibleChapter>(cacheKey);
          if (cached) return cached;
          throw error;
        }
      },
      enabled: !!book && !!chapter,
      staleTime: 1000 * 60 * 60, // 1h
    });

  // Busca (online only)
  const useSearch = (query: string, version: string = 'nvi', testament?: string) =>
    useQuery({
      queryKey: ['bible', 'search', query, version, testament],
      queryFn: async () => {
        const params = new URLSearchParams({ q: query, version });
        if (testament) params.append('testament', testament);
        const response = await api.get(`/bible/search?${params}`);
        return response.data;
      },
      enabled: query.length >= 3,
    });

  // Anotações
  const useNotes = (filters?: { version?: string; book?: string; chapter?: number }) =>
    useQuery<BibleNote[]>({
      queryKey: ['bible', 'notes', filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.version) params.append('version', filters.version);
        if (filters?.book) params.append('book', filters.book);
        if (filters?.chapter) params.append('chapter', String(filters.chapter));
        const response = await api.get(`/bible/notes?${params}`);
        return response.data;
      },
    });

  const createNote = useMutation({
    mutationFn: (data: {
      version_code: string;
      book_abbrev: string;
      chapter: number;
      verse: number;
      content: string;
      is_public?: boolean;
    }) => api.post('/bible/notes', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'notes'] });
    },
  });

  const updateNote = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.put(`/bible/notes/${id}`, { content }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'notes'] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id: string) => api.delete(`/bible/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'notes'] });
    },
  });

  // Destaques
  const useHighlights = (filters?: { version?: string; book?: string; chapter?: number }) =>
    useQuery<BibleHighlight[]>({
      queryKey: ['bible', 'highlights', filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.version) params.append('version', filters.version);
        if (filters?.book) params.append('book', filters.book);
        if (filters?.chapter) params.append('chapter', String(filters.chapter));
        const response = await api.get(`/bible/highlights?${params}`);
        return response.data;
      },
    });

  const createHighlight = useMutation({
    mutationFn: (data: {
      version_code: string;
      book_abbrev: string;
      chapter: number;
      verse: int;
      color?: string;
      category?: string;
    }) => api.post('/bible/highlights', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'highlights'] });
    },
  });

  const deleteHighlight = useMutation({
    mutationFn: (id: string) => api.delete(`/bible/highlights/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'highlights'] });
    },
  });

  return {
    useVersions,
    useBooks,
    useChapter,
    useSearch,
    useNotes,
    createNote,
    updateNote,
    deleteNote,
    useHighlights,
    createHighlight,
    deleteHighlight,
  };
}
```

---

### 2. Screen: Leitor de Bíblia

**Arquivo:** `apps/mobile/src/screens/BibleReaderScreen.tsx`

```typescript
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useBible } from '@/hooks/useBible';
import { BibleVerse } from '@/components/bible/BibleVerse';
import { ChevronLeft, ChevronRight, BookOpen } from '@/components/icons';

export function BibleReaderScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [version, setVersion] = useState('nvi');
  const [book, setBook] = useState('gn');
  const [chapter, setChapter] = useState(1);

  const scrollRef = useRef<ScrollView>(null);
  const bible = useBible();

  const { data: versions } = bible.useVersions();
  const { data: books } = bible.useBooks(version);
  const { data: chapterData, isLoading } = bible.useChapter(book, chapter, version);
  const { data: notes } = bible.useNotes({ version, book, chapter });
  const { data: highlights } = bible.useHighlights({ version, book, chapter });

  const goToPrevious = () => {
    if (chapterData?.previous_chapter) {
      setBook(chapterData.previous_chapter.book);
      setChapter(chapterData.previous_chapter.chapter);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const goToNext = () => {
    if (chapterData?.next_chapter) {
      setBook(chapterData.next_chapter.book);
      setChapter(chapterData.next_chapter.chapter);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      {/* Header com seletores */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerIcon}>
          <BookOpen size={24} color={isDark ? '#fff' : '#000'} />
        </View>

        <View style={styles.selectors}>
          <Picker
            selectedValue={version}
            onValueChange={setVersion}
            style={[styles.picker, isDark && styles.pickerDark]}
          >
            {versions?.map((v) => (
              <Picker.Item key={v.code} label={v.code.toUpperCase()} value={v.code} />
            ))}
          </Picker>

          <Picker
            selectedValue={book}
            onValueChange={setBook}
            style={[styles.picker, isDark && styles.pickerDark]}
          >
            {books?.map((b: any) => (
              <Picker.Item key={b.abbrev} label={b.name} value={b.abbrev} />
            ))}
          </Picker>

          <Picker
            selectedValue={chapter}
            onValueChange={setChapter}
            style={[styles.pickerSmall, isDark && styles.pickerDark]}
          >
            {Array.from(
              { length: books?.find((b: any) => b.abbrev === book)?.chapters_count || 1 },
              (_, i) => i + 1
            ).map((num) => (
              <Picker.Item key={num} label={String(num)} value={num} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Título do capítulo */}
      <View style={[styles.titleContainer, isDark && styles.titleContainerDark]}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          {chapterData?.book_name} {chapter}
        </Text>
        {chapterData?.title && (
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {chapterData.title}
          </Text>
        )}
      </View>

      {/* Conteúdo */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            Carregando...
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {chapterData?.verses.map((verse) => {
            const verseNotes = notes?.filter((n) => n.verse === verse.number) || [];
            const verseHighlight = highlights?.find((h) => h.verse === verse.number);

            return (
              <BibleVerse
                key={verse.number}
                verse={verse}
                highlight={verseHighlight}
                notes={verseNotes}
                version={version}
                book={book}
                chapter={chapter}
                isDark={isDark}
              />
            );
          })}
        </ScrollView>
      )}

      {/* Navegação */}
      <View style={[styles.navigation, isDark && styles.navigationDark]}>
        <TouchableOpacity
          style={[styles.navButton, !chapterData?.previous_chapter && styles.navButtonDisabled]}
          onPress={goToPrevious}
          disabled={!chapterData?.previous_chapter}
        >
          <ChevronLeft size={20} color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.navButtonText, isDark && styles.navButtonTextDark]}>
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !chapterData?.next_chapter && styles.navButtonDisabled]}
          onPress={goToNext}
          disabled={!chapterData?.next_chapter}
        >
          <Text style={[styles.navButtonText, isDark && styles.navButtonTextDark]}>
            Próximo
          </Text>
          <ChevronRight size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerDark: {
    borderBottomColor: '#333',
  },
  headerIcon: {
    marginRight: 12,
  },
  selectors: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  picker: {
    flex: 1,
  },
  pickerDark: {
    color: '#fff',
  },
  pickerSmall: {
    width: 80,
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  titleContainerDark: {
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  subtitleDark: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  loadingTextDark: {
    color: '#999',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  navigationDark: {
    borderTopColor: '#333',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  navButtonDark: {
    backgroundColor: '#333',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    marginHorizontal: 8,
    fontWeight: '600',
    color: '#000',
  },
  navButtonTextDark: {
    color: '#fff',
  },
});
```

---

### 3. Componente: Versículo Mobile

**Arquivo:** `apps/mobile/src/components/bible/BibleVerse.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useBible, type BibleVerse as VerseType, type BibleNote, type BibleHighlight } from '@/hooks/useBible';
import { MessageSquare, Highlighter, Trash2, X } from '@/components/icons';

const HIGHLIGHT_COLORS = {
  yellow: { light: '#fef3c7', dark: '#78350f' },
  green: { light: '#d1fae5', dark: '#065f46' },
  blue: { light: '#dbeafe', dark: '#1e3a8a' },
  pink: { light: '#fce7f3', dark: '#831843' },
  orange: { light: '#fed7aa', dark: '#7c2d12' },
};

interface Props {
  verse: VerseType;
  highlight?: BibleHighlight;
  notes: BibleNote[];
  version: string;
  book: string;
  chapter: number;
  isDark: boolean;
}

export function BibleVerse({ verse, highlight, notes, version, book, chapter, isDark }: Props) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const bible = useBible();

  const handleAddNote = async () => {
    await bible.createNote.mutateAsync({
      version_code: version,
      book_abbrev: book,
      chapter,
      verse: verse.number,
      content: noteContent,
      is_public: false,
    });
    setNoteContent('');
    setShowNoteModal(false);
  };

  const handleHighlight = async (color: string) => {
    await bible.createHighlight.mutateAsync({
      version_code: version,
      book_abbrev: book,
      chapter,
      verse: verse.number,
      color,
    });
    setShowHighlightModal(false);
  };

  const handleRemoveHighlight = async () => {
    if (highlight) {
      await bible.deleteHighlight.mutateAsync(highlight.id);
      setShowHighlightModal(false);
    }
  };

  const highlightColor = highlight
    ? HIGHLIGHT_COLORS[highlight.color as keyof typeof HIGHLIGHT_COLORS]?.[isDark ? 'dark' : 'light']
    : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.verseContainer}>
        <Text style={[styles.verseNumber, isDark && styles.verseNumberDark]}>
          {verse.number}
        </Text>
        <Text
          style={[
            styles.verseText,
            isDark && styles.verseTextDark,
            highlightColor && { backgroundColor: highlightColor },
          ]}
        >
          {verse.text}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowNoteModal(true)}
        >
          <MessageSquare
            size={20}
            color={notes.length > 0 ? '#3b82f6' : (isDark ? '#999' : '#666')}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowHighlightModal(true)}
        >
          <Highlighter
            size={20}
            color={highlight ? '#3b82f6' : (isDark ? '#999' : '#666')}
          />
        </TouchableOpacity>
      </View>

      {/* Modal de Anotações */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                Anotações
              </Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <X size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {notes.map((note) => (
                <View key={note.id} style={[styles.noteCard, isDark && styles.noteCardDark]}>
                  <Text style={[styles.noteText, isDark && styles.noteTextDark]}>
                    {note.content}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => bible.deleteNote.mutate(note.id)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <TextInput
                style={[styles.noteInput, isDark && styles.noteInputDark]}
                placeholder="Escreva sua anotação..."
                placeholderTextColor={isDark ? '#666' : '#999'}
                multiline
                numberOfLines={4}
                value={noteContent}
                onChangeText={setNoteContent}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleAddNote}
              >
                <Text style={styles.buttonPrimaryText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Destaques */}
      <Modal
        visible={showHighlightModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowHighlightModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                Destacar
              </Text>
              <TouchableOpacity onPress={() => setShowHighlightModal(false)}>
                <X size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <View style={styles.colorPicker}>
              {Object.entries(HIGHLIGHT_COLORS).map(([color, shades]) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: shades.light },
                    highlight?.color === color && styles.colorButtonSelected,
                  ]}
                  onPress={() => handleHighlight(color)}
                />
              ))}
            </View>

            {highlight && (
              <TouchableOpacity
                style={[styles.button, styles.buttonDanger]}
                onPress={handleRemoveHighlight}
              >
                <Text style={styles.buttonDangerText}>Remover Destaque</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  verseContainer: {
    flexDirection: 'row',
  },
  verseNumber: {
    width: 32,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  verseNumberDark: {
    color: '#999',
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  verseTextDark: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 32,
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalContentDark: {
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalTitleDark: {
    color: '#fff',
  },
  modalBody: {
    maxHeight: 400,
  },
  noteCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteCardDark: {
    backgroundColor: '#333',
  },
  noteText: {
    fontSize: 14,
    color: '#000',
  },
  noteTextDark: {
    color: '#fff',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  noteInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#000',
  },
  noteInputDark: {
    backgroundColor: '#333',
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#e5e5e5',
  },
  buttonSecondaryText: {
    color: '#000',
    fontWeight: '600',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonDangerText: {
    color: '#fff',
    fontWeight: '600',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#3b82f6',
    borderWidth: 3,
  },
});
```

---

## ✅ Checklist de Implementação

### Frontend Mobile
- [ ] Criar hook `useBible.ts` com cache offline
- [ ] Screen `BibleReaderScreen.tsx`
- [ ] Componente `BibleVerse.tsx` com modais
- [ ] Screen `BibleSearchScreen.tsx`
- [ ] Screen `ReadingPlansScreen.tsx`
- [ ] Configurar AsyncStorage para cache
- [ ] Configurar notificações push (planos de leitura)
- [ ] Testes E2E com Detox
- [ ] Otimizar performance (FlatList virtualizado)

---

## 📊 Estimativa

**Tempo:** 12-16 horas

**Breakdown:**
- Hook useBible com offline: 2-3h
- BibleReaderScreen: 3-4h
- BibleVerse com modais: 3-4h
- BibleSearchScreen: 2-3h
- ReadingPlansScreen: 2-3h
- Notificações push: 2h

---

## ➡️ Próximo Passo

**Fase 8:** Performance e Índices — Otimizações de banco e queries
