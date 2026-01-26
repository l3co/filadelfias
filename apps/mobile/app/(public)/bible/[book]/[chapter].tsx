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
