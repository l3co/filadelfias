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
