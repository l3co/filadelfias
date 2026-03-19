# Fase 6 — Frontend Web

Interface completa de leitura bíblica e estudo para a aplicação web.

---

## 🎯 Objetivo

Criar interface web moderna e responsiva com:
- Leitor de Bíblia redesenhado
- Busca full-text com filtros
- Sistema de anotações inline
- Destaques com cores
- Painel de planos de leitura
- Progresso visual

---

## ⚛️ Frontend Web — Componentes

### 1. Hook Customizado: `useBible`

**Arquivo:** `apps/web/src/hooks/useBible.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

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

export interface SearchResult {
  book: string;
  book_abbrev: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
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

export function useBible() {
  const queryClient = useQueryClient();

  // Versões disponíveis
  const useVersions = () =>
    useQuery({
      queryKey: ['bible', 'versions'],
      queryFn: () => api.get('/bible/versions').then((r) => r.data),
    });

  // Livros de uma versão
  const useBooks = (version: string = 'nvi') =>
    useQuery({
      queryKey: ['bible', 'books', version],
      queryFn: () => api.get(`/bible/books?version=${version}`).then((r) => r.data),
    });

  // Capítulo completo
  const useChapter = (book: string, chapter: number, version: string = 'nvi') =>
    useQuery<BibleChapter>({
      queryKey: ['bible', 'chapter', version, book, chapter],
      queryFn: () =>
        api.get(`/bible/${book}/${chapter}?version=${version}`).then((r) => r.data),
      enabled: !!book && !!chapter,
    });

  // Busca full-text
  const useSearch = (query: string, version: string = 'nvi', testament?: string) =>
    useQuery({
      queryKey: ['bible', 'search', query, version, testament],
      queryFn: () => {
        const params = new URLSearchParams({ q: query, version });
        if (testament) params.append('testament', testament);
        return api.get(`/bible/search?${params}`).then((r) => r.data);
      },
      enabled: query.length >= 3,
    });

  // Anotações do usuário
  const useNotes = (filters?: { version?: string; book?: string; chapter?: number }) =>
    useQuery<BibleNote[]>({
      queryKey: ['bible', 'notes', filters],
      queryFn: () => {
        const params = new URLSearchParams();
        if (filters?.version) params.append('version', filters.version);
        if (filters?.book) params.append('book', filters.book);
        if (filters?.chapter) params.append('chapter', String(filters.chapter));
        return api.get(`/bible/notes?${params}`).then((r) => r.data);
      },
    });

  // Criar anotação
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

  // Atualizar anotação
  const updateNote = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.put(`/bible/notes/${id}`, { content }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'notes'] });
    },
  });

  // Deletar anotação
  const deleteNote = useMutation({
    mutationFn: (id: string) => api.delete(`/bible/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'notes'] });
    },
  });

  // Destaques do usuário
  const useHighlights = (filters?: { version?: string; book?: string; chapter?: number }) =>
    useQuery<BibleHighlight[]>({
      queryKey: ['bible', 'highlights', filters],
      queryFn: () => {
        const params = new URLSearchParams();
        if (filters?.version) params.append('version', filters.version);
        if (filters?.book) params.append('book', filters.book);
        if (filters?.chapter) params.append('chapter', String(filters.chapter));
        return api.get(`/bible/highlights?${params}`).then((r) => r.data);
      },
    });

  // Criar/atualizar destaque
  const createHighlight = useMutation({
    mutationFn: (data: {
      version_code: string;
      book_abbrev: string;
      chapter: number;
      verse: number;
      color?: string;
      category?: string;
    }) => api.post('/bible/highlights', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible', 'highlights'] });
    },
  });

  // Deletar destaque
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

### 2. Componente: Leitor de Bíblia

**Arquivo:** `apps/web/src/components/bible/BibleReader.tsx`

```typescript
import { useState } from 'react';
import { useBible } from '@/hooks/useBible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { BibleVerse } from './BibleVerse';

export function BibleReader() {
  const [version, setVersion] = useState('nvi');
  const [book, setBook] = useState('gn');
  const [chapter, setChapter] = useState(1);

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
    }
  };

  const goToNext = () => {
    if (chapterData?.next_chapter) {
      setBook(chapterData.next_chapter.book);
      setChapter(chapterData.next_chapter.chapter);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <CardTitle>Leitura Bíblica</CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Seletor de versão */}
              <Select value={version} onValueChange={setVersion}>
                {versions?.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.name}
                  </option>
                ))}
              </Select>

              {/* Seletor de livro */}
              <Select value={book} onValueChange={setBook}>
                {books?.map((b: any) => (
                  <option key={b.abbrev} value={b.abbrev}>
                    {b.name}
                  </option>
                ))}
              </Select>

              {/* Seletor de capítulo */}
              <Select
                value={String(chapter)}
                onValueChange={(v) => setChapter(Number(v))}
              >
                {Array.from(
                  { length: books?.find((b: any) => b.abbrev === book)?.chapters_count || 1 },
                  (_, i) => i + 1
                ).map((num) => (
                  <option key={num} value={num}>
                    Cap. {num}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo do capítulo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {chapterData?.book_name} {chapter}
            {chapterData?.title && (
              <span className="block text-sm text-muted-foreground mt-1">
                {chapterData.title}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <div className="space-y-2">
              {chapterData?.verses.map((verse) => {
                const verseNotes = notes?.filter((n) => n.verse === verse.number) || [];
                const verseHighlight = highlights?.find(
                  (h) => h.verse === verse.number
                );

                return (
                  <BibleVerse
                    key={verse.number}
                    verse={verse}
                    highlight={verseHighlight}
                    notes={verseNotes}
                    version={version}
                    book={book}
                    chapter={chapter}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={!chapterData?.previous_chapter}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <Button
          variant="outline"
          onClick={goToNext}
          disabled={!chapterData?.next_chapter}
        >
          Próximo
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
```

---

### 3. Componente: Versículo

**Arquivo:** `apps/web/src/components/bible/BibleVerse.tsx`

```typescript
import { useState } from 'react';
import { useBible, type BibleVerse as VerseType, type BibleNote, type BibleHighlight } from '@/hooks/useBible';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquare, Highlighter, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const HIGHLIGHT_COLORS = {
  yellow: 'bg-yellow-200 dark:bg-yellow-900/30',
  green: 'bg-green-200 dark:bg-green-900/30',
  blue: 'bg-blue-200 dark:bg-blue-900/30',
  pink: 'bg-pink-200 dark:bg-pink-900/30',
  orange: 'bg-orange-200 dark:bg-orange-900/30',
};

interface Props {
  verse: VerseType;
  highlight?: BibleHighlight;
  notes: BibleNote[];
  version: string;
  book: string;
  chapter: number;
}

export function BibleVerse({ verse, highlight, notes, version, book, chapter }: Props) {
  const [noteContent, setNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
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
    setShowNoteForm(false);
  };

  const handleHighlight = async (color: string) => {
    await bible.createHighlight.mutateAsync({
      version_code: version,
      book_abbrev: book,
      chapter,
      verse: verse.number,
      color,
    });
  };

  const handleRemoveHighlight = async () => {
    if (highlight) {
      await bible.deleteHighlight.mutateAsync(highlight.id);
    }
  };

  return (
    <div className="group relative py-2 px-4 rounded-lg transition-colors hover:bg-accent/50">
      {/* Número do versículo */}
      <span className="inline-block w-8 text-sm font-semibold text-muted-foreground mr-2">
        {verse.number}
      </span>

      {/* Texto do versículo com destaque */}
      <span
        className={cn(
          'inline',
          highlight && HIGHLIGHT_COLORS[highlight.color as keyof typeof HIGHLIGHT_COLORS]
        )}
      >
        {verse.text}
      </span>

      {/* Ações (aparecem no hover) */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {/* Anotação */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" className="h-7 w-7">
              <MessageSquare className={cn('h-4 w-4', notes.length > 0 && 'text-primary')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Anotações</h4>
              
              {notes.map((note) => (
                <div key={note.id} className="p-2 bg-muted rounded text-sm">
                  <p>{note.content}</p>
                  <div className="flex justify-end mt-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => bible.deleteNote.mutate(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {showNoteForm ? (
                <div className="space-y-2">
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Escreva sua anotação..."
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddNote}>
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowNoteForm(false);
                        setNoteContent('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setShowNoteForm(true)}>
                  + Nova Anotação
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Destaque */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" className="h-7 w-7">
              <Highlighter className={cn('h-4 w-4', highlight && 'text-primary')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Destacar</h4>
              <div className="flex gap-2">
                {Object.keys(HIGHLIGHT_COLORS).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleHighlight(color)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2',
                      HIGHLIGHT_COLORS[color as keyof typeof HIGHLIGHT_COLORS],
                      highlight?.color === color && 'border-primary'
                    )}
                  />
                ))}
              </div>
              {highlight && (
                <Button size="sm" variant="outline" onClick={handleRemoveHighlight}>
                  Remover Destaque
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
```

---

### 4. Componente: Busca

**Arquivo:** `apps/web/src/components/bible/BibleSearch.tsx`

```typescript
import { useState } from 'react';
import { useBible } from '@/hooks/useBible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Search } from 'lucide-react';

export function BibleSearch() {
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState('nvi');
  const [testament, setTestament] = useState<string | undefined>();

  const bible = useBible();
  const { data: versions } = bible.useVersions();
  const { data: searchResults, isLoading } = bible.useSearch(query, version, testament);

  return (
    <div className="container mx-auto py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar na Bíblia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campos de busca */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite uma palavra ou frase..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            
            <Select value={version} onValueChange={setVersion}>
              {versions?.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.name}
                </option>
              ))}
            </Select>

            <Select value={testament || 'all'} onValueChange={(v) => setTestament(v === 'all' ? undefined : v)}>
              <option value="all">Toda Bíblia</option>
              <option value="OT">Antigo Testamento</option>
              <option value="NT">Novo Testamento</option>
            </Select>
          </div>

          {/* Resultados */}
          {query.length >= 3 && (
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-4">Buscando...</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {searchResults?.total || 0} resultado(s) encontrado(s)
                  </p>

                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {searchResults?.results.map((result, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <p className="text-sm font-semibold text-primary mb-1">
                            {result.reference}
                          </p>
                          <p className="text-sm">{result.text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 5. Roteamento

**Arquivo:** `apps/web/src/App.tsx` (adicionar rotas)

```typescript
import { BibleReader } from '@/components/bible/BibleReader';
import { BibleSearch } from '@/components/bible/BibleSearch';
import { ReadingPlans } from '@/components/bible/ReadingPlans';

// Adicionar às rotas
<Route path="/bible" element={<BibleReader />} />
<Route path="/bible/search" element={<BibleSearch />} />
<Route path="/bible/plans" element={<ReadingPlans />} />
```

---

## ✅ Checklist de Implementação

### Frontend Web
- [ ] Criar hook `useBible.ts`
- [ ] Componente `BibleReader.tsx`
- [ ] Componente `BibleVerse.tsx` com anotações inline
- [ ] Componente `BibleSearch.tsx`
- [ ] Componente `ReadingPlans.tsx` (planos de leitura)
- [ ] Adicionar rotas no App.tsx
- [ ] Testes E2E com Playwright
- [ ] Responsividade mobile
- [ ] Dark mode

---

## 🎨 Design System

**Cores de destaque:**
- Yellow: Promessas
- Green: Comandos
- Blue: Profecias
- Pink: Orações
- Orange: Importantes

**Tipografia:**
- Versículos: texto legível, espaçamento confortável
- Títulos de capítulos: destaque visual
- Notas: fonte menor, fundo diferenciado

---

## 📊 Estimativa

**Tempo:** 12-16 horas

**Breakdown:**
- Hook useBible: 2h
- BibleReader: 3-4h
- BibleVerse com anotações: 3-4h
- BibleSearch: 2-3h
- ReadingPlans: 3-4h
- Testes E2E: 2h

---

## ➡️ Próximo Passo

**Fase 7:** Frontend Mobile — Interface otimizada para React Native
