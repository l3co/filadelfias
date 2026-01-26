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
