import { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, PanResponder, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, ChevronDown, Settings2, Volume2, VolumeX } from 'lucide-react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { BibleReaderControls } from '@/components/features/BibleReaderControls';
import { ChapterSelector } from '@/components/features/ChapterSelector';
import { VerseActionMenu } from '@/components/features/VerseActionMenu';
import { bibleService } from '@/services/bible';
import { useBibleSettings } from '@/hooks/useBibleSettings';
import { useTTS } from '@/hooks/useTTS';
import { colors } from '@/constants/colors';

export default function BibleChapterScreen() {
    const { book, chapter } = useLocalSearchParams<{ book: string; chapter: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [showControls, setShowControls] = useState(false);
    const [showChapterSelector, setShowChapterSelector] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState<{ index: number; text: string } | null>(null);
    
    const { settings, setVersion, increaseFontSize, decreaseFontSize, toggleDarkMode } = useBibleSettings();
    const { isSpeaking, currentVerseIndex, speak, stop } = useTTS();

    // Swipe gesture handling - must be before any conditional returns
    const panX = useRef(new Animated.Value(0)).current;
    const swipeThreshold = 80;
    const dataRef = useRef<{ previous_chapter?: { book: string; chapter: number }; next_chapter?: { book: string; chapter: number } } | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['bible', 'chapter', book, chapter, settings.version],
        queryFn: () => bibleService.getChapter(book, parseInt(chapter), settings.version),
        enabled: !!book && !!chapter,
    });

    // Update ref when data changes
    dataRef.current = data || null;

    const navigateTo = (b: string, c: number) => {
        stop();
        router.replace(`/(public)/bible/${b}/${c}`);
    };

    // Pan responder for swipe gestures - must use ref for data access
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
            },
            onPanResponderMove: (_, gestureState) => {
                panX.setValue(gestureState.dx);
            },
            onPanResponderRelease: (_, gestureState) => {
                const currentData = dataRef.current;
                if (gestureState.dx > swipeThreshold && currentData?.previous_chapter) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigateTo(currentData.previous_chapter.book, currentData.previous_chapter.chapter);
                } else if (gestureState.dx < -swipeThreshold && currentData?.next_chapter) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigateTo(currentData.next_chapter.book, currentData.next_chapter.chapter);
                }
                Animated.spring(panX, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            },
        })
    ).current;

    if (isLoading) {
        return <LoadingScreen />;
    }

    const handleTTS = () => {
        if (data?.verses) {
            speak(data.verses);
        }
    };

    const handleLongPress = (index: number, text: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedVerse({ index, text });
    };

    const bgColor = settings.isDarkMode ? '#0f172a' : '#ffffff';
    const textColor = settings.isDarkMode ? '#e2e8f0' : '#1e293b';
    const verseNumColor = settings.isDarkMode ? '#34d399' : '#059669';
    const headerBg = settings.isDarkMode ? '#1e293b' : '#ffffff';
    const borderColor = settings.isDarkMode ? '#334155' : '#f1f5f9';

    return (
        <View className="flex-1" style={{ backgroundColor: bgColor }}>
            <StatusBar barStyle={settings.isDarkMode ? 'light-content' : 'dark-content'} />
            
            {/* Header Premium */}
            <View 
                style={{ 
                    backgroundColor: headerBg, 
                    paddingTop: insets.top,
                    borderBottomWidth: 1,
                    borderBottomColor: borderColor,
                }}
            >
                <View className="flex-row items-center justify-between px-4 py-3">
                    {/* Voltar */}
                    <Pressable
                        onPress={() => router.back()}
                        className="flex-row items-center"
                    >
                        <ChevronLeft size={24} color={settings.isDarkMode ? '#e2e8f0' : colors.slate[600]} />
                    </Pressable>

                    {/* Título Central com Seletor de Capítulo */}
                    <Pressable 
                        onPress={() => setShowChapterSelector(true)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: settings.isDarkMode ? '#334155' : '#f1f5f9',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 10,
                        }}
                    >
                        <Text 
                            style={{ 
                                fontSize: 16,
                                fontWeight: '700',
                                color: settings.isDarkMode ? '#ffffff' : '#0f172a',
                            }}
                        >
                            {data?.book_name} {chapter}
                        </Text>
                        <View 
                            style={{ 
                                marginLeft: 6,
                                backgroundColor: settings.isDarkMode ? '#475569' : '#e2e8f0',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                            }}
                        >
                            <Text 
                                style={{ 
                                    fontSize: 10,
                                    fontWeight: '700',
                                    color: verseNumColor,
                                    textTransform: 'uppercase',
                                }}
                            >
                                {settings.version}
                            </Text>
                        </View>
                        <ChevronDown 
                            size={16} 
                            color={settings.isDarkMode ? '#94a3b8' : '#64748b'} 
                            style={{ marginLeft: 4 }}
                        />
                    </Pressable>

                    {/* Ações */}
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={handleTTS}
                            className="p-2 mr-1"
                        >
                            {isSpeaking ? (
                                <VolumeX size={22} color={colors.primary[500]} />
                            ) : (
                                <Volume2 size={22} color={settings.isDarkMode ? '#94a3b8' : colors.slate[500]} />
                            )}
                        </Pressable>
                        <Pressable
                            onPress={() => setShowControls(true)}
                            className="p-2"
                        >
                            <Settings2 size={22} color={settings.isDarkMode ? '#94a3b8' : colors.slate[500]} />
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Conteúdo da Bíblia com Swipe */}
            <Animated.View 
                style={{ flex: 1, transform: [{ translateX: panX }] }}
                {...panResponder.panHandlers}
            >
                <ScrollView 
                    className="flex-1 px-5 py-6"
                    showsVerticalScrollIndicator={false}
                >
                    {data?.verses.map((verse, index) => (
                        <Pressable
                            key={index}
                            onPress={() => speak(data.verses, index)}
                            onLongPress={() => handleLongPress(index + 1, verse)}
                            delayLongPress={400}
                            className={`mb-1 py-1 px-2 -mx-2 rounded-lg ${
                                currentVerseIndex === index 
                                    ? settings.isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
                                    : ''
                            }`}
                        >
                            <Text 
                                style={{ 
                                    fontSize: settings.fontSize, 
                                    lineHeight: settings.fontSize * 1.8,
                                    color: textColor,
                                }}
                            >
                                <Text 
                                    style={{ 
                                        color: verseNumColor, 
                                        fontWeight: '700',
                                        fontSize: settings.fontSize * 0.75,
                                    }}
                                >
                                    {index + 1}{' '}
                                </Text>
                                {verse}
                            </Text>
                        </Pressable>
                    ))}
                    
                    {/* Espaço extra no final */}
                    <View className="h-20" />
                </ScrollView>
            </Animated.View>

            {/* Navegação entre capítulos */}
            <View 
                className="flex-row"
                style={{ 
                    backgroundColor: headerBg,
                    borderTopWidth: 1,
                    borderTopColor: borderColor,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                }}
            >
                <Pressable
                    onPress={() => data?.previous_chapter &&
                        navigateTo(data.previous_chapter.book, data.previous_chapter.chapter)
                    }
                    disabled={!data?.previous_chapter}
                    className="flex-1 flex-row items-center justify-center py-4"
                    style={{ opacity: data?.previous_chapter ? 1 : 0.3 }}
                >
                    <ChevronLeft size={20} color={verseNumColor} />
                    <Text style={{ color: verseNumColor }} className="font-semibold ml-1">
                        Anterior
                    </Text>
                </Pressable>

                <View style={{ width: 1, backgroundColor: borderColor }} />

                <Pressable
                    onPress={() => data?.next_chapter &&
                        navigateTo(data.next_chapter.book, data.next_chapter.chapter)
                    }
                    disabled={!data?.next_chapter}
                    className="flex-1 flex-row items-center justify-center py-4"
                    style={{ opacity: data?.next_chapter ? 1 : 0.3 }}
                >
                    <Text style={{ color: verseNumColor }} className="font-semibold mr-1">
                        Próximo
                    </Text>
                    <ChevronRight size={20} color={verseNumColor} />
                </Pressable>
            </View>

            {/* Modal de Controles */}
            <BibleReaderControls
                visible={showControls}
                onClose={() => setShowControls(false)}
                version={settings.version}
                fontSize={settings.fontSize}
                isDarkMode={settings.isDarkMode}
                isSpeaking={isSpeaking}
                onVersionChange={setVersion}
                onFontIncrease={increaseFontSize}
                onFontDecrease={decreaseFontSize}
                onToggleDarkMode={toggleDarkMode}
                onToggleTTS={handleTTS}
            />

            {/* Menu de Ações do Versículo */}
            {selectedVerse && (
                <VerseActionMenu
                    visible={!!selectedVerse}
                    onClose={() => setSelectedVerse(null)}
                    verse={selectedVerse.text}
                    verseNumber={selectedVerse.index}
                    bookName={data?.book_name || ''}
                    chapter={parseInt(chapter)}
                    version={settings.version}
                    isDarkMode={settings.isDarkMode}
                    onSpeak={() => speak(data?.verses || [], selectedVerse.index - 1)}
                />
            )}

            {/* Seletor de Capítulo */}
            <ChapterSelector
                visible={showChapterSelector}
                onClose={() => setShowChapterSelector(false)}
                currentBook={book}
                currentChapter={parseInt(chapter)}
                onSelect={(selectedBook, selectedChapter) => {
                    setShowChapterSelector(false);
                    navigateTo(selectedBook, selectedChapter);
                }}
                isDarkMode={settings.isDarkMode}
            />
        </View>
    );
}
