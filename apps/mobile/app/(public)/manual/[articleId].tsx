import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, List, Minus, Plus } from 'lucide-react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { manualService } from '@/services/manual';

export default function ManualArticleScreen() {
    const { articleId } = useLocalSearchParams<{ articleId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [fontSize, setFontSize] = useState(18);
    
    // Decode the article ID (it may be URL encoded due to slashes)
    const decodedArticleId = articleId ? decodeURIComponent(articleId) : '';

    const { data: article, isLoading } = useQuery({
        queryKey: ['manual', 'article', decodedArticleId],
        queryFn: () => manualService.getArticle(decodedArticleId),
        enabled: !!decodedArticleId,
    });

    const increaseFontSize = () => {
        Haptics.selectionAsync();
        setFontSize(Math.min(fontSize + 2, 28));
    };

    const decreaseFontSize = () => {
        Haptics.selectionAsync();
        setFontSize(Math.max(fontSize - 2, 14));
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: insets.top }}>
            {/* Header Premium */}
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                paddingHorizontal: 16, 
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
            }}>
                <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
                    <ChevronLeft size={24} color="#475569" />
                </Pressable>

                <View style={{ 
                    backgroundColor: '#ecfdf5', 
                    paddingHorizontal: 12, 
                    paddingVertical: 4, 
                    borderRadius: 8 
                }}>
                    <Text style={{ fontWeight: '700', color: '#059669' }}>
                        Art. {article?.number}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable onPress={decreaseFontSize} style={{ padding: 8 }}>
                        <Minus size={20} color="#64748b" />
                    </Pressable>
                    <Pressable onPress={increaseFontSize} style={{ padding: 8 }}>
                        <Plus size={20} color="#64748b" />
                    </Pressable>
                    <Pressable 
                        onPress={() => router.push('/(public)/manual')} 
                        style={{ padding: 8, marginRight: -8 }}
                    >
                        <List size={20} color="#64748b" />
                    </Pressable>
                </View>
            </View>

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Conteúdo */}
                {article?.structure.map((item, index) => (
                    <View key={index} style={{ marginBottom: 16 }}>
                        {item.marker && (
                            <View style={{
                                backgroundColor: '#f0fdf4',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 6,
                                alignSelf: 'flex-start',
                                marginBottom: 8,
                            }}>
                                <Text style={{ 
                                    fontSize: 12, 
                                    fontWeight: '600', 
                                    color: '#059669',
                                    textTransform: 'uppercase',
                                }}>
                                    {item.marker}
                                </Text>
                            </View>
                        )}
                        <Text style={{ 
                            fontSize, 
                            color: '#334155', 
                            lineHeight: fontSize * 1.6,
                        }}>
                            {item.text}
                        </Text>
                    </View>
                ))}

                {/* Notas */}
                {article?.notes && article.notes.length > 0 && (
                    <View style={{ 
                        marginTop: 24, 
                        paddingTop: 24, 
                        borderTopWidth: 1, 
                        borderTopColor: '#f1f5f9' 
                    }}>
                        <Text style={{ fontWeight: '600', color: '#64748b', marginBottom: 12 }}>
                            Notas
                        </Text>
                        {article.notes.map((note, index) => (
                            <View key={index} style={{ marginBottom: 8 }}>
                                <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20 }}>
                                    <Text style={{ fontWeight: '600' }}>{note.marker}</Text> {note.text}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Navegação */}
            <View style={{ 
                flexDirection: 'row', 
                borderTopWidth: 1, 
                borderTopColor: '#f1f5f9', 
                backgroundColor: '#ffffff',
                paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            }}>
                <Pressable
                    onPress={() => article?.navigation.previous &&
                        router.replace(`/(public)/manual/${encodeURIComponent(article.navigation.previous.id)}`)
                    }
                    disabled={!article?.navigation.previous}
                    style={{ 
                        flex: 1, 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        paddingVertical: 16,
                        opacity: article?.navigation.previous ? 1 : 0.3,
                    }}
                >
                    <ChevronLeft size={20} color="#10b981" />
                    <Text style={{ color: '#10b981', fontWeight: '600', marginLeft: 4 }}>
                        Art. {article?.navigation.previous?.number || '-'}
                    </Text>
                </Pressable>

                <View style={{ width: 1, backgroundColor: '#f1f5f9' }} />

                <Pressable
                    onPress={() => article?.navigation.next &&
                        router.replace(`/(public)/manual/${encodeURIComponent(article.navigation.next.id)}`)
                    }
                    disabled={!article?.navigation.next}
                    style={{ 
                        flex: 1, 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        paddingVertical: 16,
                        opacity: article?.navigation.next ? 1 : 0.3,
                    }}
                >
                    <Text style={{ color: '#10b981', fontWeight: '600', marginRight: 4 }}>
                        Art. {article?.navigation.next?.number || '-'}
                    </Text>
                    <ChevronRight size={20} color="#10b981" />
                </Pressable>
            </View>
        </View>
    );
}
