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

    // Helper type guard cause sometimes API data structure is tricky
    // But our types say chapters have sections or articles.
    // The code in 04-FASE1-PUBLICO.md assumes this:
    // const firstArticle = chapter.articles[0] || chapter.sections[0]?.articles[0];

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
