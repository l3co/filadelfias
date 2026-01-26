import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, ChevronDown, Book, Search, X } from 'lucide-react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { manualService, ManualChapter } from '@/services/manual';
import { colors } from '@/constants/colors';

export default function ManualIndexScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

    const { data: structure, isLoading } = useQuery({
        queryKey: ['manual', 'structure'],
        queryFn: manualService.getStructure,
    });

    const { data: searchResults } = useQuery({
        queryKey: ['manual', 'search', search],
        queryFn: () => manualService.search(search, 20),
        enabled: search.length >= 2,
    });

    if (isLoading) {
        return <LoadingScreen message="Carregando manual..." />;
    }

    const toggleChapter = (chapterId: string) => {
        const newExpanded = new Set(expandedChapters);
        if (newExpanded.has(chapterId)) {
            newExpanded.delete(chapterId);
        } else {
            newExpanded.add(chapterId);
        }
        setExpandedChapters(newExpanded);
    };

    const navigateToArticle = (articleId: string) => {
        const encodedId = encodeURIComponent(articleId);
        router.push(`/(public)/manual/${encodedId}`);
    };

    const renderChapter = (chapter: ManualChapter) => {
        const isExpanded = expandedChapters.has(chapter.id);
        const articles = chapter.articles.length > 0 
            ? chapter.articles 
            : chapter.sections?.flatMap(s => s.articles) || [];

        return (
            <View key={chapter.id} style={{ marginBottom: 8 }}>
                <Pressable
                    onPress={() => toggleChapter(chapter.id)}
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 12,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: isExpanded ? '#10b981' : '#f1f5f9',
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', color: '#334155' }}>
                            Capítulo {chapter.number}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>
                            {chapter.title}
                        </Text>
                    </View>
                    {isExpanded ? (
                        <ChevronDown size={20} color="#10b981" />
                    ) : (
                        <ChevronRight size={20} color="#94a3b8" />
                    )}
                </Pressable>

                {/* Artigos expandidos */}
                {isExpanded && articles.length > 0 && (
                    <View style={{ 
                        marginLeft: 16, 
                        marginTop: 8, 
                        borderLeftWidth: 2, 
                        borderLeftColor: '#10b981',
                        paddingLeft: 12,
                    }}>
                        {articles.map((article) => (
                            <Pressable
                                key={article.id}
                                onPress={() => navigateToArticle(article.id)}
                                style={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 14,
                                    marginBottom: 6,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <View style={{
                                    backgroundColor: '#10b981',
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    marginRight: 10,
                                }}>
                                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                                        Art. {article.number}
                                    </Text>
                                </View>
                                <ChevronRight size={16} color="#94a3b8" />
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
            {/* Header Premium */}
            <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 }}>
                    Manual IPB
                </Text>
                <Text style={{ color: '#64748b', marginTop: 4 }}>
                    {structure?.metadata.title} • {structure?.total_articles} artigos
                </Text>
            </View>

            {/* Busca */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                }}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Buscar no manual..."
                        value={search}
                        onChangeText={setSearch}
                        style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#0f172a' }}
                        placeholderTextColor="#94a3b8"
                    />
                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch('')} style={{ padding: 4 }}>
                            <X size={18} color="#94a3b8" />
                        </Pressable>
                    )}
                </View>
            </View>

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Resultados da busca */}
                {search.length >= 2 && searchResults?.results ? (
                    <View>
                        <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>
                            {searchResults.count} resultado(s) para "{search}"
                        </Text>
                        {searchResults.results.map((result) => (
                            <Pressable
                                key={result.id}
                                onPress={() => navigateToArticle(result.id)}
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 8,
                                    borderWidth: 1,
                                    borderColor: '#f1f5f9',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={{
                                        backgroundColor: '#10b981',
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                        borderRadius: 4,
                                    }}>
                                        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                                            Art. {result.number}
                                        </Text>
                                    </View>
                                    <Text style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
                                        {result.chapter}
                                    </Text>
                                </View>
                                <Text style={{ color: '#334155', lineHeight: 20 }} numberOfLines={2}>
                                    {result.excerpt}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                ) : (
                    /* Navegação por capítulos */
                    structure?.parts.map((part) => (
                        <View key={part.id} style={{ marginBottom: 20 }}>
                            <Text style={{ 
                                fontSize: 18, 
                                fontWeight: '700', 
                                color: '#0f172a', 
                                marginBottom: 12,
                                paddingLeft: 4,
                            }}>
                                {part.title}
                            </Text>
                            {part.chapters.map(renderChapter)}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
