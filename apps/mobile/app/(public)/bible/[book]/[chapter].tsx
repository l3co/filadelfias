import { useMemo, useState, useRef } from 'react';
import { View, Text, FlatList, Pressable, StatusBar, PanResponder, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, ChevronDown, Settings2, Volume2, VolumeX } from 'lucide-react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { BibleReaderControls } from '@/components/features/BibleReaderControls';
import { ChapterSelector } from '@/components/features/ChapterSelector';
import { VerseActionMenu } from '@/components/features/VerseActionMenu';
import { bibleService, BibleChapter } from '@/services/bible';
import { offlineService } from '@/services/offline';
import {
    useBibleNotes,
    useBibleHighlights,
    useCreateBibleNote,
    useUpdateBibleNote,
    useDeleteBibleNote,
    useCreateBibleHighlight,
    useDeleteBibleHighlight,
} from '@/hooks/useBible';
import { useBibleSettings } from '@/hooks/useBibleSettings';
import { useTTS } from '@/hooks/useTTS';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

export default function BibleChapterScreen() {
    const { book, chapter } = useLocalSearchParams<{ book: string; chapter: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { getCurrentTenant, user } = useAuthStore();
    const tenant = getCurrentTenant();
    const [showControls, setShowControls] = useState(false);
    const [showChapterSelector, setShowChapterSelector] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState<{ index: number; text: string } | null>(null);
    
    const { settings, setVersion, increaseFontSize, decreaseFontSize, toggleDarkMode } = useBibleSettings();
    const { isSpeaking, currentVerseIndex, speak, stop } = useTTS();

    // Swipe gesture handling - must be before any conditional returns
    const panX = useRef(new Animated.Value(0)).current;
    const swipeThreshold = 80;
    const dataRef = useRef<{ previous_chapter?: { book: string; chapter: number }; next_chapter?: { book: string; chapter: number } } | null>(null);

    const bookCode = String(book || '');
    const chapterNumber = Number.parseInt(String(chapter || ''), 10);
    const { data, isLoading } = useQuery({
        queryKey: ['bible', 'chapter', bookCode, chapterNumber, settings.version],
        queryFn: async (): Promise<BibleChapter> => {
            const offlineData = await offlineService.getBibleChapterOffline(bookCode, chapterNumber, settings.version);
            if (offlineData) {
                return {
                    ...offlineData,
                    previous_chapter: chapterNumber > 1 ? { book: bookCode, chapter: chapterNumber - 1 } : undefined,
                    next_chapter: { book: bookCode, chapter: chapterNumber + 1 },
                };
            }

            return bibleService.getChapter(bookCode, chapterNumber, settings.version);
        },
        enabled: Boolean(bookCode && Number.isFinite(chapterNumber)),
    });
    const { data: notes = [] } = useBibleNotes(tenant?.id, {
        version: settings.version,
        book: bookCode,
        chapter: chapterNumber,
    });
    const { data: highlights = [] } = useBibleHighlights(tenant?.id, {
        version: settings.version,
        book: bookCode,
        chapter: chapterNumber,
    });
    const createNote = useCreateBibleNote();
    const updateNote = useUpdateBibleNote();
    const deleteNote = useDeleteBibleNote();
    const createHighlight = useCreateBibleHighlight();
    const deleteHighlight = useDeleteBibleHighlight();

    const selectedNote = useMemo(
        () => notes.find((item) => item.verse === selectedVerse?.index) ?? null,
        [notes, selectedVerse?.index]
    );
    const selectedHighlight = useMemo(
        () => highlights.find((item) => item.verse === selectedVerse?.index) ?? null,
        [highlights, selectedVerse?.index]
    );
    const highlightByVerse = useMemo(
        () => new Map(highlights.map((item) => [item.verse, item])),
        [highlights]
    );

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

    const handleSaveNote = (content: string) => {
        if (!selectedVerse || !tenant?.id || !user?.id || !content) {
            return;
        }

        if (selectedNote) {
            updateNote.mutate({ id: selectedNote.id, content });
            return;
        }

        createNote.mutate({
            tenant_id: tenant.id,
            version_code: settings.version,
            book_abbrev: bookCode,
            chapter: chapterNumber,
            verse: selectedVerse.index,
            content,
            is_public: false,
        });
    };

    const handleDeleteNote = () => {
        if (!selectedNote) {
            return;
        }

        deleteNote.mutate(selectedNote.id);
    };

    const handleToggleHighlight = (color: string) => {
        if (!selectedVerse || !tenant?.id || !user?.id) {
            return;
        }

        if (selectedHighlight?.color === color) {
            deleteHighlight.mutate(selectedHighlight.id);
            return;
        }

        if (selectedHighlight) {
            deleteHighlight.mutate(selectedHighlight.id, {
                onSuccess: () => {
                    createHighlight.mutate({
                        tenant_id: tenant.id,
                        version_code: settings.version,
                        book_abbrev: bookCode,
                        chapter: chapterNumber,
                        verse: selectedVerse.index,
                        color,
                    });
                },
            });
            return;
        }

        createHighlight.mutate({
            tenant_id: tenant.id,
            version_code: settings.version,
            book_abbrev: bookCode,
            chapter: chapterNumber,
            verse: selectedVerse.index,
            color,
        });
    };

    const handleDeleteHighlight = () => {
        if (!selectedHighlight) {
            return;
        }

        deleteHighlight.mutate(selectedHighlight.id);
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
                <FlatList
                    data={data?.verses ?? []}
                    keyExtractor={(_, index) => `${bookCode}-${chapterNumber}-${index + 1}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 80 }}
                    initialNumToRender={24}
                    windowSize={10}
                    renderItem={({ item: verse, index }) => {
                        const verseHighlight = highlightByVerse.get(index + 1);
                        const highlightBackground =
                            verseHighlight?.color === 'yellow'
                                ? settings.isDarkMode ? 'rgba(250, 204, 21, 0.16)' : 'rgba(250, 204, 21, 0.20)'
                                : verseHighlight?.color === 'green'
                                  ? settings.isDarkMode ? 'rgba(74, 222, 128, 0.16)' : 'rgba(74, 222, 128, 0.20)'
                                  : verseHighlight?.color === 'blue'
                                    ? settings.isDarkMode ? 'rgba(96, 165, 250, 0.16)' : 'rgba(96, 165, 250, 0.20)'
                                    : verseHighlight?.color === 'pink'
                                      ? settings.isDarkMode ? 'rgba(244, 114, 182, 0.16)' : 'rgba(244, 114, 182, 0.20)'
                                      : undefined;

                        return (
                            <Pressable
                                onPress={() => speak(data?.verses || [], index)}
                                onLongPress={() => handleLongPress(index + 1, verse)}
                                delayLongPress={400}
                                className={`mb-1 py-1 px-2 -mx-2 rounded-lg ${
                                    currentVerseIndex === index
                                        ? settings.isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
                                        : ''
                                }`}
                                style={highlightBackground ? { backgroundColor: highlightBackground } : undefined}
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
                        );
                    }}
                />
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
                    studyModeEnabled={Boolean(tenant?.id && user?.id)}
                    note={selectedNote}
                    highlight={selectedHighlight}
                    onSaveNote={handleSaveNote}
                    onDeleteNote={handleDeleteNote}
                    onToggleHighlight={handleToggleHighlight}
                    onDeleteHighlight={handleDeleteHighlight}
                    isSavingNote={createNote.isPending || updateNote.isPending}
                    isDeletingNote={deleteNote.isPending}
                    isSavingHighlight={createHighlight.isPending}
                    isDeletingHighlight={deleteHighlight.isPending}
                />
            )}

            {/* Seletor de Capítulo */}
            <ChapterSelector
                visible={showChapterSelector}
                onClose={() => setShowChapterSelector(false)}
                currentBook={bookCode}
                currentChapter={chapterNumber}
                version={settings.version}
                onSelect={(selectedBook, selectedChapter) => {
                    setShowChapterSelector(false);
                    navigateTo(selectedBook, selectedChapter);
                }}
                isDarkMode={settings.isDarkMode}
            />
        </View>
    );
}
