# 📖 Fase 1: Área Pública

## Objetivo
Implementar as telas públicas que não requerem autenticação: Welcome, Bíblia, Hinário e Manual.

---

## Telas a Implementar

### 1. Welcome/Home Screen

```tsx
// app/(public)/index.tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BookOpen, Music, BookMarked, LogIn, Download } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const features = [
    {
      icon: BookOpen,
      title: 'Bíblia Sagrada',
      description: 'Leia em múltiplas versões',
      href: '/(public)/bible',
      color: '#3b82f6',
    },
    {
      icon: Music,
      title: 'Hinário',
      description: 'Novo Cântico',
      href: '/(public)/hymnal',
      color: '#8b5cf6',
    },
    {
      icon: BookMarked,
      title: 'Manual IPB',
      description: 'Edição 2019',
      href: '/(public)/manual',
      color: '#059669',
    },
  ];

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header com Gradiente */}
      <LinearGradient
        colors={colors.gradients.primary}
        className="px-6 pt-8 pb-12 rounded-b-[32px]"
      >
        <Text className="text-white text-3xl font-bold">Filadélfias</Text>
        <Text className="text-emerald-100 mt-2 text-base">
          Sua biblioteca cristã de bolso
        </Text>
      </LinearGradient>

      <ScrollView 
        className="flex-1 px-4 -mt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Cards de Features */}
        <View className="gap-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Pressable
                key={feature.href}
                onPress={() => router.push(feature.href)}
                className="bg-white rounded-2xl p-4 flex-row items-center shadow-lg shadow-slate-200 active:scale-[0.98]"
              >
                <View 
                  className="h-14 w-14 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <Icon size={28} color={feature.color} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-semibold text-lg text-slate-900">
                    {feature.title}
                  </Text>
                  <Text className="text-slate-500">{feature.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Download Offline */}
        <Pressable
          onPress={() => router.push('/(public)/downloads')}
          className="mt-6 bg-slate-50 rounded-2xl p-4 flex-row items-center border border-slate-100"
        >
          <Download size={24} color={colors.slate[600]} />
          <View className="ml-3 flex-1">
            <Text className="font-medium text-slate-700">Leitura Offline</Text>
            <Text className="text-sm text-slate-500">
              Baixe para ler sem internet
            </Text>
          </View>
        </Pressable>

        {/* Botão de Login */}
        <View className="mt-8 mb-8">
          <Button
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            icon={<LogIn size={20} color={colors.primary[600]} />}
          >
            Entrar na minha conta
          </Button>
          
          <Text className="text-center text-sm text-slate-400 mt-4">
            Membro de uma igreja? Faça login para acessar{'\n'}
            devocionais, eventos e mais.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
```

---

### 2. Bíblia - Lista de Livros

```tsx
// app/(public)/bible/index.tsx
import { View, Text, FlatList, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { bibleService, BibleBook } from '@/services/bible';
import { useBibleVersion } from '@/hooks/useBibleVersion';
import { VersionSelector } from '@/components/features/VersionSelector';

export default function BibleBooksScreen() {
  const router = useRouter();
  const { version, setVersion } = useBibleVersion();
  
  const { data: books, isLoading } = useQuery({
    queryKey: ['bible', 'books', version],
    queryFn: () => bibleService.getBooks(version),
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando livros..." />;
  }

  const oldTestament = books?.filter((b) => b.testament === 'old') || [];
  const newTestament = books?.filter((b) => b.testament === 'new') || [];

  const renderBook = ({ item }: { item: BibleBook }) => (
    <Pressable
      onPress={() => router.push(`/(public)/bible/${item.abbrev}/1`)}
      className="flex-1 bg-white rounded-xl p-3 m-1 border border-slate-100 active:bg-slate-50"
    >
      <Text className="font-medium text-slate-800">{item.name}</Text>
      <Text className="text-xs text-slate-400">{item.chapters_count} cap.</Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Bíblia Sagrada" showBack />
      
      {/* Seletor de Versão */}
      <VersionSelector 
        value={version} 
        onChange={setVersion} 
      />

      <FlatList
        data={[
          { title: 'Antigo Testamento', data: oldTestament },
          { title: 'Novo Testamento', data: newTestament },
        ]}
        renderItem={({ item: section }) => (
          <View className="px-3">
            <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide py-3">
              {section.title}
            </Text>
            <FlatList
              data={section.data}
              renderItem={renderBook}
              keyExtractor={(item) => item.abbrev}
              numColumns={2}
              scrollEnabled={false}
            />
          </View>
        )}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
```

---

### 3. Bíblia - Leitura de Capítulo

```tsx
// app/(public)/bible/[book]/[chapter].tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, List } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { bibleService } from '@/services/bible';
import { useBibleVersion } from '@/hooks/useBibleVersion';
import { colors } from '@/constants/colors';

export default function BibleChapterScreen() {
  const { book, chapter } = useLocalSearchParams<{ book: string; chapter: string }>();
  const router = useRouter();
  const { version } = useBibleVersion();

  const { data, isLoading } = useQuery({
    queryKey: ['bible', 'chapter', book, chapter, version],
    queryFn: () => bibleService.getChapter(book, parseInt(chapter), version),
    enabled: !!book && !!chapter,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  const navigateTo = (b: string, c: number) => {
    router.replace(`/(public)/bible/${b}/${c}`);
  };

  return (
    <View className="flex-1 bg-white">
      <Header 
        title={`${data?.book_name} ${chapter}`}
        showBack
        rightAction={
          <Pressable 
            onPress={() => router.push('/(public)/bible')}
            className="p-2"
          >
            <List size={22} color={colors.slate[600]} />
          </Pressable>
        }
      />

      <ScrollView className="flex-1 px-5 py-4">
        {data?.verses.map((verse, index) => (
          <Text key={index} className="text-lg leading-8 text-slate-800 mb-2">
            <Text className="text-emerald-600 font-bold text-sm align-top">
              {index + 1}{' '}
            </Text>
            {verse}
          </Text>
        ))}
      </ScrollView>

      {/* Navegação entre capítulos */}
      <View className="flex-row border-t border-slate-100 bg-white">
        <Pressable
          onPress={() => data?.previous_chapter && 
            navigateTo(data.previous_chapter.book, data.previous_chapter.chapter)
          }
          disabled={!data?.previous_chapter}
          className="flex-1 flex-row items-center justify-center py-4 opacity-100 disabled:opacity-30"
        >
          <ChevronLeft size={20} color={colors.primary[600]} />
          <Text className="text-emerald-600 font-medium ml-1">Anterior</Text>
        </Pressable>
        
        <View className="w-px bg-slate-100" />
        
        <Pressable
          onPress={() => data?.next_chapter && 
            navigateTo(data.next_chapter.book, data.next_chapter.chapter)
          }
          disabled={!data?.next_chapter}
          className="flex-1 flex-row items-center justify-center py-4 opacity-100 disabled:opacity-30"
        >
          <Text className="text-emerald-600 font-medium mr-1">Próximo</Text>
          <ChevronRight size={20} color={colors.primary[600]} />
        </Pressable>
      </View>
    </View>
  );
}
```

---

### 4. Hinário - Lista de Hinos

```tsx
// app/(public)/hymnal/index.tsx
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Search, Music } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { hymnalService, Hymn } from '@/services/hymnal';
import { colors } from '@/constants/colors';

export default function HymnalListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: hymns, isLoading } = useQuery({
    queryKey: ['hymnal'],
    queryFn: hymnalService.getHymns,
  });

  const filteredHymns = hymns?.filter((hymn) =>
    hymn.title.toLowerCase().includes(search.toLowerCase()) ||
    hymn.number.toString().includes(search)
  );

  if (isLoading) {
    return <LoadingScreen message="Carregando hinário..." />;
  }

  const renderHymn = ({ item }: { item: Hymn }) => (
    <Pressable
      onPress={() => router.push(`/(public)/hymnal/${item.number}`)}
      className="flex-row items-center bg-white p-4 border-b border-slate-50"
    >
      <View className="h-10 w-10 rounded-lg bg-purple-50 items-center justify-center mr-3">
        <Text className="font-bold text-purple-600">{item.number}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-medium text-slate-800">{item.title}</Text>
        <Text className="text-sm text-slate-400">{item.author}</Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Hinário Novo Cântico" showBack />
      
      {/* Busca */}
      <View className="px-4 py-3 bg-white border-b border-slate-100">
        <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2">
          <Search size={20} color={colors.slate[400]} />
          <TextInput
            placeholder="Buscar por número ou título..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-base"
            placeholderTextColor={colors.slate[400]}
          />
        </View>
      </View>

      <FlatList
        data={filteredHymns}
        renderItem={renderHymn}
        keyExtractor={(item) => item.number.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
```

---

### 5. Hinário - Visualização de Hino

```tsx
// app/(public)/hymnal/[number].tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { hymnalService } from '@/services/hymnal';
import { colors } from '@/constants/colors';

export default function HymnViewScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const router = useRouter();
  const hymnNumber = parseInt(number);

  const { data: hymn, isLoading } = useQuery({
    queryKey: ['hymnal', number],
    queryFn: () => hymnalService.getHymn(hymnNumber),
    enabled: !!number,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <Header showBack />

      <ScrollView className="flex-1 px-5 py-4">
        {/* Número e Título */}
        <View className="items-center mb-6">
          <View className="h-16 w-16 rounded-2xl bg-purple-50 items-center justify-center mb-3">
            <Text className="text-2xl font-bold text-purple-600">{hymn?.number}</Text>
          </View>
          <Text className="text-xl font-bold text-slate-900 text-center">
            {hymn?.title}
          </Text>
          <Text className="text-slate-500 mt-1">{hymn?.author}</Text>
        </View>

        {/* Letra */}
        {hymn?.lyrics.map((stanza, index) => (
          <View key={index} className="mb-6">
            <Text className="text-sm font-semibold text-purple-600 mb-2">
              {index === 0 ? 'Estrofe 1' : stanza.startsWith('Coro') ? 'Coro' : `Estrofe ${index + 1}`}
            </Text>
            <Text className="text-lg text-slate-700 leading-7">{stanza}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Navegação */}
      <View className="flex-row border-t border-slate-100 bg-white">
        <Pressable
          onPress={() => router.replace(`/(public)/hymnal/${hymnNumber - 1}`)}
          disabled={hymnNumber <= 1}
          className="flex-1 flex-row items-center justify-center py-4 disabled:opacity-30"
        >
          <ChevronLeft size={20} color={colors.primary[600]} />
          <Text className="text-emerald-600 font-medium ml-1">Anterior</Text>
        </Pressable>
        
        <View className="w-px bg-slate-100" />
        
        <Pressable
          onPress={() => router.replace(`/(public)/hymnal/${hymnNumber + 1}`)}
          className="flex-1 flex-row items-center justify-center py-4"
        >
          <Text className="text-emerald-600 font-medium mr-1">Próximo</Text>
          <ChevronRight size={20} color={colors.primary[600]} />
        </Pressable>
      </View>
    </View>
  );
}
```

---

### 6. Manual IPB - Estrutura

```tsx
// app/(public)/manual/index.tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronRight, Book } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { manualService } from '@/services/manual';
import { colors } from '@/constants/colors';

export default function ManualIndexScreen() {
  const router = useRouter();

  const { data: structure, isLoading } = useQuery({
    queryKey: ['manual', 'structure'],
    queryFn: manualService.getStructure,
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando manual..." />;
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Manual IPB" showBack />

      <ScrollView className="flex-1 p-4">
        {/* Metadata */}
        <View className="bg-emerald-50 rounded-2xl p-4 mb-4 border border-emerald-100">
          <View className="flex-row items-center">
            <Book size={24} color={colors.primary[600]} />
            <View className="ml-3">
              <Text className="font-semibold text-emerald-800">
                {structure?.metadata.title}
              </Text>
              <Text className="text-sm text-emerald-600">
                Edição {structure?.metadata.editionYear} · {structure?.total_articles} artigos
              </Text>
            </View>
          </View>
        </View>

        {/* Parts */}
        {structure?.parts.map((part) => (
          <View key={part.id} className="mb-4">
            <Text className="text-lg font-bold text-slate-800 mb-2">
              {part.title}
            </Text>
            
            {part.chapters.map((chapter) => (
              <Pressable
                key={chapter.id}
                onPress={() => {
                  // Navegar para o primeiro artigo do capítulo
                  const firstArticle = chapter.articles[0] || 
                    chapter.sections[0]?.articles[0];
                  if (firstArticle) {
                    router.push(`/(public)/manual/${firstArticle.id}`);
                  }
                }}
                className="bg-white rounded-xl p-4 mb-2 flex-row items-center border border-slate-100"
              >
                <View className="flex-1">
                  <Text className="font-medium text-slate-700">
                    Capítulo {chapter.number}
                  </Text>
                  <Text className="text-sm text-slate-500">{chapter.title}</Text>
                </View>
                <ChevronRight size={20} color={colors.slate[400]} />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
```

---

### 7. Manual IPB - Artigo

```tsx
// app/(public)/manual/[articleId].tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, List } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { manualService } from '@/services/manual';
import { colors } from '@/constants/colors';

export default function ManualArticleScreen() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const router = useRouter();

  const { data: article, isLoading } = useQuery({
    queryKey: ['manual', 'article', articleId],
    queryFn: () => manualService.getArticle(articleId),
    enabled: !!articleId,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <Header 
        title={`Art. ${article?.number}`}
        showBack
        rightAction={
          <Pressable 
            onPress={() => router.push('/(public)/manual')}
            className="p-2"
          >
            <List size={22} color={colors.slate[600]} />
          </Pressable>
        }
      />

      <ScrollView className="flex-1 px-5 py-4">
        {/* Número do Artigo */}
        <View className="bg-emerald-50 rounded-xl px-4 py-2 self-start mb-4">
          <Text className="font-bold text-emerald-700">Artigo {article?.number}</Text>
        </View>

        {/* Conteúdo */}
        {article?.structure.map((item, index) => (
          <View key={index} className="mb-4">
            {item.marker && (
              <Text className="text-sm font-semibold text-emerald-600 mb-1">
                {item.marker}
              </Text>
            )}
            <Text className="text-lg text-slate-700 leading-7">{item.text}</Text>
          </View>
        ))}

        {/* Notas */}
        {article?.notes && article.notes.length > 0 && (
          <View className="mt-6 pt-6 border-t border-slate-100">
            <Text className="font-semibold text-slate-500 mb-3">Notas</Text>
            {article.notes.map((note, index) => (
              <View key={index} className="mb-2">
                <Text className="text-sm text-slate-600">
                  <Text className="font-semibold">{note.marker}</Text> {note.text}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navegação */}
      <View className="flex-row border-t border-slate-100 bg-white">
        <Pressable
          onPress={() => article?.navigation.previous && 
            router.replace(`/(public)/manual/${article.navigation.previous.id}`)
          }
          disabled={!article?.navigation.previous}
          className="flex-1 flex-row items-center justify-center py-4 disabled:opacity-30"
        >
          <ChevronLeft size={20} color={colors.primary[600]} />
          <Text className="text-emerald-600 font-medium ml-1">
            Art. {article?.navigation.previous?.number || '-'}
          </Text>
        </Pressable>
        
        <View className="w-px bg-slate-100" />
        
        <Pressable
          onPress={() => article?.navigation.next && 
            router.replace(`/(public)/manual/${article.navigation.next.id}`)
          }
          disabled={!article?.navigation.next}
          className="flex-1 flex-row items-center justify-center py-4 disabled:opacity-30"
        >
          <Text className="text-emerald-600 font-medium mr-1">
            Art. {article?.navigation.next?.number || '-'}
          </Text>
          <ChevronRight size={20} color={colors.primary[600]} />
        </Pressable>
      </View>
    </View>
  );
}
```

---

## Hooks Auxiliares

### useBibleVersion
```tsx
// src/hooks/useBibleVersion.ts
import { useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const VERSION_KEY = 'bible_version';

export function useBibleVersion() {
  const [version, setVersionState] = useState<string>('nvi');

  useEffect(() => {
    const saved = storage.getString(VERSION_KEY);
    if (saved) {
      setVersionState(saved);
    }
  }, []);

  const setVersion = (v: string) => {
    storage.set(VERSION_KEY, v);
    setVersionState(v);
  };

  return { version, setVersion };
}
```

---

## Componentes Auxiliares

### VersionSelector
```tsx
// src/components/features/VersionSelector.tsx
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Check } from 'lucide-react-native';
import { bibleService, BibleVersion } from '@/services/bible';
import { colors } from '@/constants/colors';

interface VersionSelectorProps {
  value: string;
  onChange: (version: string) => void;
}

export function VersionSelector({ value, onChange }: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: versions } = useQuery({
    queryKey: ['bible', 'versions'],
    queryFn: bibleService.getVersions,
  });

  const selectedVersion = versions?.find((v) => v.id === value);

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100"
      >
        <View>
          <Text className="text-xs text-slate-400 uppercase">Versão</Text>
          <Text className="font-medium text-slate-800">
            {selectedVersion?.name || value.toUpperCase()}
          </Text>
        </View>
        <ChevronDown size={20} color={colors.slate[400]} />
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 bg-white pt-4">
          <View className="flex-row items-center justify-between px-4 pb-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-900">Selecionar Versão</Text>
            <Pressable onPress={() => setIsOpen(false)}>
              <Text className="text-emerald-600 font-medium">Fechar</Text>
            </Pressable>
          </View>

          <FlatList
            data={versions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item.id);
                  setIsOpen(false);
                }}
                className="flex-row items-center px-4 py-4 border-b border-slate-50"
              >
                <View className="flex-1">
                  <Text className="font-medium text-slate-800">{item.name}</Text>
                  <Text className="text-sm text-slate-500">{item.description}</Text>
                </View>
                {value === item.id && (
                  <Check size={20} color={colors.primary[600]} />
                )}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </>
  );
}
```

---

## Próximos Passos

1. → [05-FASE2-AUTH.md](./05-FASE2-AUTH.md) - Implementação da autenticação
