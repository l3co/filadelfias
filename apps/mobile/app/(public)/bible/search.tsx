import { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Search, X } from 'lucide-react-native';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useBibleSearch } from '@/hooks/useBible';
import { useBibleVersion } from '@/hooks/useBibleVersion';

type TestamentFilter = 'ALL' | 'OT' | 'NT';

const FILTERS: Array<{ label: string; value: TestamentFilter }> = [
    { label: 'Tudo', value: 'ALL' },
    { label: 'AT', value: 'OT' },
    { label: 'NT', value: 'NT' },
];

export default function BibleSearchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { version } = useBibleVersion();
    const [query, setQuery] = useState('');
    const [testament, setTestament] = useState<TestamentFilter>('ALL');

    const normalizedQuery = query.trim();
    const searchParams = useMemo(
        () => ({
            query: normalizedQuery,
            version,
            testament: testament === 'ALL' ? undefined : testament,
            limit: 50,
            offset: 0,
        }),
        [normalizedQuery, testament, version]
    );

    const { data, isLoading } = useBibleSearch(searchParams);

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 12,
                }}
            >
                <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
                    <ChevronLeft size={24} color="#475569" />
                </Pressable>

                <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', marginLeft: 8 }}>
                    Buscar na Bíblia
                </Text>
            </View>

            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                        paddingHorizontal: 14,
                        minHeight: 52,
                    }}
                >
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Digite uma palavra ou frase"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{
                            flex: 1,
                            marginLeft: 10,
                            fontSize: 16,
                            color: '#0f172a',
                        }}
                    />
                    {query.length > 0 && (
                        <Pressable onPress={() => setQuery('')} style={{ padding: 4 }}>
                            <X size={18} color="#94a3b8" />
                        </Pressable>
                    )}
                </View>

                <Text style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
                    Versão atual: {version.toUpperCase()}
                </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
                {FILTERS.map((filter) => {
                    const active = testament === filter.value;
                    return (
                        <Pressable
                            key={filter.value}
                            onPress={() => setTestament(filter.value)}
                            style={{
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                borderRadius: 999,
                                backgroundColor: active ? '#10b981' : '#ffffff',
                                borderWidth: 1,
                                borderColor: active ? '#10b981' : '#e2e8f0',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: '600',
                                    color: active ? '#ffffff' : '#475569',
                                }}
                            >
                                {filter.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {isLoading ? (
                <LoadingScreen message="Buscando versículos..." />
            ) : normalizedQuery.length < 2 ? (
                <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                    <Text style={{ fontSize: 15, color: '#64748b', lineHeight: 22 }}>
                        Digite pelo menos 2 caracteres para buscar por referência, tema ou trecho.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={data?.results ?? []}
                    keyExtractor={(item) => `${item.book_abbrev}-${item.chapter}-${item.verse}`}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    ListHeaderComponent={
                        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                            {data?.total ?? 0} resultado(s)
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={{ paddingTop: 24 }}>
                            <Text style={{ fontSize: 15, color: '#64748b' }}>
                                Nenhum versículo encontrado para essa busca.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => router.push(`/(public)/bible/${item.book_abbrev}/${item.chapter}`)}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#e2e8f0',
                                marginBottom: 10,
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#10b981', marginBottom: 6 }}>
                                {item.reference}
                            </Text>
                            <Text style={{ fontSize: 15, lineHeight: 22, color: '#0f172a' }}>
                                {item.text}
                            </Text>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}
