import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BookOpen, Music, BookMarked, LogIn, ChevronRight, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const getDailyVerse = () => ({
        reference: '2 Timóteo 3:16-17',
        text: 'Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça.',
    });

    const verse = getDailyVerse();

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Header */}
                <View className="px-5 pt-6 pb-4">
                    <Text className="text-3xl font-bold text-slate-900 tracking-tight">
                        Filadélfias
                    </Text>
                    <Text className="text-slate-500 mt-1">
                        {getGreeting()}! Sua biblioteca cristã de bolso.
                    </Text>
                </View>

                {/* Card Leia a Bíblia Hoje */}
                <Pressable
                    onPress={() => router.push('/(public)/bible')}
                    className="mx-5 mb-4 active:scale-[0.98]"
                >
                    <LinearGradient
                        colors={['#002333', '#064e3b']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-2xl p-5 overflow-hidden"
                    >
                        {/* Decorative circles */}
                        <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500/10" />
                        <View className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-teal-500/10" />
                        
                        <View className="flex-row items-center mb-3">
                            <View className="bg-white/10 px-3 py-1.5 rounded-full flex-row items-center">
                                <Sparkles size={14} color="#6ee7b7" />
                                <Text className="text-emerald-200 text-xs ml-1.5 font-medium">
                                    Versículo do dia
                                </Text>
                            </View>
                        </View>

                        <Text className="text-white text-xl font-bold mb-2">
                            Leia a Bíblia hoje
                        </Text>
                        <Text className="text-emerald-100 font-semibold mb-1">
                            {verse.reference}
                        </Text>
                        <Text className="text-emerald-100/80 text-sm leading-5" numberOfLines={3}>
                            {verse.text}
                        </Text>

                        <View className="flex-row items-center mt-4">
                            <Text className="text-white font-semibold">Começar leitura</Text>
                            <ChevronRight size={18} color="#fff" />
                        </View>
                    </LinearGradient>
                </Pressable>

                {/* Card Hinário */}
                <Pressable
                    onPress={() => router.push('/(public)/hymnal')}
                    className="mx-5 mb-4 bg-white rounded-2xl p-5 border border-slate-100 active:scale-[0.98] overflow-hidden"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                    }}
                >
                    <View className="flex-row items-start">
                        <View className="bg-violet-100 p-3 rounded-xl">
                            <Music size={24} color="#8b5cf6" />
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className="text-xl font-bold text-slate-900">Hinário</Text>
                            <Text className="text-slate-500 mt-0.5">Novo Cântico</Text>
                        </View>
                        <ChevronRight size={22} color={colors.slate[400]} />
                    </View>
                    
                    <View className="mt-4 bg-violet-50 rounded-xl p-3">
                        <Text className="text-violet-700 font-semibold">Castelo Forte</Text>
                        <Text className="text-violet-600/70 text-sm">Hino mais acessado</Text>
                    </View>
                </Pressable>

                {/* Card Manual IPB */}
                <Pressable
                    onPress={() => router.push('/(public)/manual')}
                    className="mx-5 mb-4 bg-white rounded-2xl p-5 border border-slate-100 active:scale-[0.98]"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.06,
                        shadowRadius: 12,
                        elevation: 3,
                    }}
                >
                    <View className="flex-row items-start">
                        <View className="bg-emerald-100 p-3 rounded-xl">
                            <BookMarked size={24} color="#059669" />
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className="text-xl font-bold text-slate-900">Manual IPB</Text>
                            <Text className="text-slate-500 mt-0.5">Igreja Presbiteriana do Brasil</Text>
                        </View>
                        <ChevronRight size={22} color={colors.slate[400]} />
                    </View>
                    
                    <View className="mt-4 bg-emerald-50 rounded-xl p-3">
                        <Text className="text-emerald-700 font-semibold">Edição 2019</Text>
                        <Text className="text-emerald-600/70 text-sm">Versão atualizada</Text>
                    </View>
                </Pressable>

                {/* Botão de Login */}
                <View className="mx-5 mt-4">
                    <Pressable
                        onPress={() => router.push('/(auth)/login')}
                        className="bg-white rounded-2xl p-4 border border-slate-200 flex-row items-center justify-center active:bg-slate-50"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.04,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <LogIn size={20} color={colors.primary[600]} />
                        <Text className="text-emerald-600 font-semibold ml-2">
                            Entrar na minha conta
                        </Text>
                    </Pressable>

                    <Text className="text-center text-sm text-slate-400 mt-4 leading-5">
                        Membro de uma igreja? Faça login para acessar{'\n'}
                        devocionais, eventos e mais.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
