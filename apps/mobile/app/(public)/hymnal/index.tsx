import { View, Text, FlatList, Pressable, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Music, ChevronRight, X } from 'lucide-react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { hymnalService, Hymn } from '@/services/hymnal';
import { colors } from '@/constants/colors';

type Category = 'all' | 'hymns' | 'canticos' | 'corinhos';

const categories: { id: Category; label: string; range?: [number, number] }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'hymns', label: 'Hinos', range: [1, 300] },
    { id: 'canticos', label: 'Cânticos', range: [301, 600] },
];

export default function HymnalListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<Category>('all');

    const { data: hymns, isLoading } = useQuery({
        queryKey: ['hymnal'],
        queryFn: hymnalService.getHymns,
    });

    const filteredHymns = hymns?.filter((hymn) => {
        const matchesSearch = search === '' ||
            hymn.title.toLowerCase().includes(search.toLowerCase()) ||
            hymn.number.toString().includes(search);
        
        if (!matchesSearch) return false;
        
        if (category === 'all') return true;
        
        const cat = categories.find(c => c.id === category);
        if (cat?.range) {
            return hymn.number >= cat.range[0] && hymn.number <= cat.range[1];
        }
        return true;
    });

    if (isLoading) {
        return <LoadingScreen message="Carregando hinário..." />;
    }

    const renderHymn = ({ item }: { item: Hymn }) => (
        <Pressable
            onPress={() => router.push(`/(public)/hymnal/${item.number}`)}
            className="flex-row items-center bg-white mx-4 mb-3 p-4 rounded-2xl active:scale-[0.98]"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View className="h-12 w-12 rounded-xl bg-violet-100 items-center justify-center mr-4">
                <Text className="font-bold text-violet-600 text-lg">{item.number}</Text>
            </View>
            <View className="flex-1">
                <Text className="font-semibold text-slate-900 text-base">{item.title}</Text>
                <Text className="text-sm text-slate-400 mt-0.5">{item.author || 'Autor desconhecido'}</Text>
            </View>
            <ChevronRight size={20} color={colors.slate[300]} />
        </Pressable>
    );

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
            {/* Header Premium */}
            <View className="px-5 pt-6 pb-4">
                <Text className="text-3xl font-bold text-slate-900 tracking-tight">
                    Hinário
                </Text>
                <Text className="text-slate-500 mt-1">
                    Novo Cântico • {hymns?.length || 0} hinos
                </Text>
            </View>

            {/* Busca */}
            <View className="px-4 pb-3">
                <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-slate-100">
                    <Search size={20} color={colors.slate[400]} />
                    <TextInput
                        placeholder="Buscar por número ou título..."
                        value={search}
                        onChangeText={setSearch}
                        className="flex-1 ml-3 text-base text-slate-900"
                        placeholderTextColor={colors.slate[400]}
                    />
                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch('')} className="p-1">
                            <X size={18} color={colors.slate[400]} />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Filtros de Categoria */}
            <View className="px-4 pb-4">
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
                >
                    {categories.map((cat) => (
                        <Pressable
                            key={cat.id}
                            onPress={() => setCategory(cat.id)}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                borderRadius: 12,
                                backgroundColor: category === cat.id ? '#8b5cf6' : '#ffffff',
                                borderWidth: category === cat.id ? 0 : 1,
                                borderColor: '#e2e8f0',
                            }}
                        >
                            <Text
                                style={{
                                    fontWeight: '600',
                                    color: category === cat.id ? '#ffffff' : '#475569',
                                }}
                            >
                                {cat.label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Lista de Hinos */}
            <FlatList
                data={filteredHymns}
                renderItem={renderHymn}
                keyExtractor={(item) => item.number.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View className="items-center py-12">
                        <Music size={48} color={colors.slate[300]} />
                        <Text className="text-slate-400 mt-4 text-center">
                            Nenhum hino encontrado
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
