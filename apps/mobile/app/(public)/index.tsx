import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BookOpen, Music, BookMarked, LogIn, Download } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const features = [
        {
            icon: BookOpen,
            title: 'Bíblia Sagrada',
            description: 'Leia em múltiplas versões',
            href: '/(public)/bible',
            color: '#3b82f6',
        },
        {
            icon: Music,
            title: 'Hinário',
            description: 'Novo Cântico',
            href: '/(public)/hymnal',
            color: '#8b5cf6',
        },
        {
            icon: BookMarked,
            title: 'Manual IPB',
            description: 'Edição 2019',
            href: '/(public)/manual',
            color: '#059669',
        },
    ];

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            {/* Header com Gradiente */}
            <LinearGradient
                colors={colors.gradients.primary}
                className="px-6 pt-8 pb-12 rounded-b-[32px]"
            >
                <Text className="text-white text-3xl font-bold">Filadélfias</Text>
                <Text className="text-emerald-100 mt-2 text-base">
                    Sua biblioteca cristã de bolso
                </Text>
            </LinearGradient>

            <ScrollView
                className="flex-1 px-4 -mt-6"
                showsVerticalScrollIndicator={false}
            >
                {/* Cards de Features */}
                <View className="gap-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <Pressable
                                key={feature.href}
                                onPress={() => router.push(feature.href)}
                                className="bg-white rounded-2xl p-4 flex-row items-center shadow-lg shadow-slate-200 active:scale-[0.98]"
                            >
                                <View
                                    className="h-14 w-14 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: `${feature.color}15` }}
                                >
                                    <Icon size={28} color={feature.color} />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="font-semibold text-lg text-slate-900">
                                        {feature.title}
                                    </Text>
                                    <Text className="text-slate-500">{feature.description}</Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Download Offline */}
                <Pressable
                    onPress={() => router.push('/(public)/downloads')}
                    className="mt-6 bg-slate-50 rounded-2xl p-4 flex-row items-center border border-slate-100"
                >
                    <Download size={24} color={colors.slate[600]} />
                    <View className="ml-3 flex-1">
                        <Text className="font-medium text-slate-700">Leitura Offline</Text>
                        <Text className="text-sm text-slate-500">
                            Baixe para ler sem internet
                        </Text>
                    </View>
                </Pressable>

                {/* Botão de Login */}
                <View className="mt-8 mb-8">
                    <Button
                        onPress={() => router.push('/(auth)/login')}
                        variant="outline"
                        icon={<LogIn size={20} color={colors.primary[600]} />}
                    >
                        Entrar na minha conta
                    </Button>

                    <Text className="text-center text-sm text-slate-400 mt-4">
                        Membro de uma igreja? Faça login para acessar{'\n'}
                        devocionais, eventos e mais.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
