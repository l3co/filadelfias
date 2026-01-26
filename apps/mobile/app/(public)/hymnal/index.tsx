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
