import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, Share2, Type, Minus, Plus } from 'lucide-react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { hymnalService } from '@/services/hymnal';
import { colors } from '@/constants/colors';

export default function HymnViewScreen() {
    const { number } = useLocalSearchParams<{ number: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const hymnNumber = parseInt(number);
    const [fontSize, setFontSize] = useState(18);

    const { data: hymn, isLoading } = useQuery({
        queryKey: ['hymnal', number],
        queryFn: () => hymnalService.getHymn(hymnNumber),
        enabled: !!number,
    });

    if (isLoading) {
        return <LoadingScreen />;
    }

    const handleShare = async () => {
        if (!hymn) return;
        const text = `${hymn.title}\n\n${hymn.lyrics.join('\n\n')}\n\n— Hino ${hymn.number}, ${hymn.author || 'Autor desconhecido'}`;
        try {
            await Share.share({ message: text });
        } catch (error) {
            console.error(error);
        }
    };

    const increaseFontSize = () => {
        Haptics.selectionAsync();
        setFontSize(Math.min(fontSize + 2, 28));
    };

    const decreaseFontSize = () => {
        Haptics.selectionAsync();
        setFontSize(Math.max(fontSize - 2, 14));
    };

    const navigateTo = (num: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.replace(`/(public)/hymnal/${num}`);
    };

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            {/* Header Premium */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                    <ChevronLeft size={24} color={colors.slate[600]} />
                </Pressable>

                <View style={{ width: 40 }} />

                <View className="flex-row items-center">
                    <Pressable onPress={decreaseFontSize} className="p-2">
                        <Minus size={20} color={colors.slate[500]} />
                    </Pressable>
                    <Pressable onPress={increaseFontSize} className="p-2">
                        <Plus size={20} color={colors.slate[500]} />
                    </Pressable>
                    <Pressable onPress={handleShare} className="p-2 -mr-2">
                        <Share2 size={20} color={colors.slate[500]} />
                    </Pressable>
                </View>
            </View>

            <ScrollView 
                className="flex-1 px-5 py-6"
                showsVerticalScrollIndicator={false}
            >
                {/* Número, Título e Autor */}
                <View className="items-center mb-8">
                    <Text 
                        className="font-bold text-slate-900 text-center"
                        style={{ fontSize: fontSize + 4 }}
                    >
                        <Text style={{ color: '#8b5cf6' }}>{hymn?.number}. </Text>
                        {hymn?.title}
                    </Text>
                    <Text className="text-slate-400 mt-2">
                        {hymn?.author || 'Autor desconhecido'}
                    </Text>
                </View>

                {/* Letra */}
                {hymn?.lyrics.map((stanza, index) => {
                    const isCoro = stanza.toLowerCase().startsWith('coro') || 
                                   stanza.toLowerCase().includes('refrão');
                    
                    // Contador de estrofes (exclui coros)
                    const stropheCount = hymn.lyrics.slice(0, index).filter(
                        s => !s.toLowerCase().startsWith('coro') && !s.toLowerCase().includes('refrão')
                    ).length + 1;
                    
                    return (
                        <View 
                            key={index} 
                            className="mb-6"
                        >
                            {/* Label da seção */}
                            <View 
                                style={{
                                    backgroundColor: isCoro ? '#f5f3ff' : '#f8fafc',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 8,
                                    alignSelf: 'flex-start',
                                    marginBottom: 12,
                                }}
                            >
                                <Text 
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '700',
                                        color: isCoro ? '#8b5cf6' : '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    {isCoro ? 'Coro' : `Estrofe ${stropheCount}`}
                                </Text>
                            </View>
                            
                            {/* Texto da estrofe */}
                            <View
                                style={{
                                    backgroundColor: isCoro ? '#f5f3ff' : 'transparent',
                                    padding: isCoro ? 16 : 0,
                                    borderRadius: 12,
                                    borderLeftWidth: isCoro ? 0 : 3,
                                    borderLeftColor: '#e2e8f0',
                                    paddingLeft: isCoro ? 16 : 16,
                                }}
                            >
                                <Text 
                                    style={{ 
                                        fontSize,
                                        lineHeight: fontSize * 1.6,
                                        color: isCoro ? '#5b21b6' : '#334155',
                                    }}
                                >
                                    {stanza}
                                </Text>
                            </View>
                        </View>
                    );
                })}

                <View className="h-20" />
            </ScrollView>

            {/* Navegação */}
            <View 
                className="flex-row border-t border-slate-100 bg-white"
                style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }}
            >
                <Pressable
                    onPress={() => navigateTo(hymnNumber - 1)}
                    disabled={hymnNumber <= 1}
                    className="flex-1 flex-row items-center justify-center py-4"
                    style={{ opacity: hymnNumber <= 1 ? 0.3 : 1 }}
                >
                    <ChevronLeft size={20} color="#8b5cf6" />
                    <Text className="text-violet-500 font-semibold ml-1">Anterior</Text>
                </Pressable>

                <View className="w-px bg-slate-100" />

                <Pressable
                    onPress={() => navigateTo(hymnNumber + 1)}
                    className="flex-1 flex-row items-center justify-center py-4"
                >
                    <Text className="text-violet-500 font-semibold mr-1">Próximo</Text>
                    <ChevronRight size={20} color="#8b5cf6" />
                </Pressable>
            </View>
        </View>
    );
}
