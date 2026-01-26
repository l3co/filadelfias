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
