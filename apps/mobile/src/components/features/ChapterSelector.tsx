import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronDown } from 'lucide-react-native';
import { bibleService, BibleBook } from '@/services/bible';

interface ChapterSelectorProps {
    visible: boolean;
    onClose: () => void;
    currentBook: string;
    currentChapter: number;
    onSelect: (book: string, chapter: number) => void;
    version?: string;
    isDarkMode?: boolean;
}

export function ChapterSelector({
    visible,
    onClose,
    currentBook,
    currentChapter,
    onSelect,
    version = 'nvi',
    isDarkMode = false,
}: ChapterSelectorProps) {
    const insets = useSafeAreaInsets();
    const [selectedBook, setSelectedBook] = useState<string | null>(null);

    const { data: books } = useQuery({
        queryKey: ['bible', 'books', version],
        queryFn: () => bibleService.getBooks(version),
    });

    const bgColor = isDarkMode ? '#1e293b' : '#ffffff';
    const textColor = isDarkMode ? '#ffffff' : '#0f172a';
    const subtextColor = isDarkMode ? '#94a3b8' : '#64748b';
    const borderColor = isDarkMode ? '#334155' : '#f1f5f9';
    const activeBg = isDarkMode ? '#334155' : '#f0fdf4';

    const handleBookSelect = (bookId: string) => {
        if (selectedBook === bookId) {
            setSelectedBook(null);
        } else {
            setSelectedBook(bookId);
        }
    };

    const handleChapterSelect = (bookId: string, chapter: number) => {
        onSelect(bookId, chapter);
        onClose();
        setSelectedBook(null);
    };

    const renderBook = ({ item }: { item: BibleBook }) => {
        const isExpanded = selectedBook === item.abbrev;
        const isCurrentBook = currentBook === item.abbrev;

        return (
            <View>
                <Pressable
                    onPress={() => handleBookSelect(item.abbrev)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        backgroundColor: isCurrentBook ? activeBg : 'transparent',
                        borderBottomWidth: 1,
                        borderBottomColor: borderColor,
                    }}
                >
                    <Text style={{ 
                        fontSize: 16, 
                        fontWeight: isCurrentBook ? '600' : '400',
                        color: isCurrentBook ? '#10b981' : textColor,
                    }}>
                        {item.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, color: subtextColor, marginRight: 8 }}>
                            {item.chapters_count} cap.
                        </Text>
                        <ChevronDown 
                            size={18} 
                            color={subtextColor}
                            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                        />
                    </View>
                </Pressable>

                {/* Capítulos expandidos */}
                {isExpanded && (
                    <View style={{ 
                        flexDirection: 'row', 
                        flexWrap: 'wrap', 
                        padding: 12,
                        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                    }}>
                        {Array.from({ length: item.chapters_count }, (_, i) => i + 1).map((chapterNum) => {
                            const isCurrentChapter = isCurrentBook && currentChapter === chapterNum;
                            return (
                                <Pressable
                                    key={chapterNum}
                                    onPress={() => handleChapterSelect(item.abbrev, chapterNum)}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        margin: 4,
                                        borderRadius: 10,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isCurrentChapter ? '#10b981' : (isDarkMode ? '#334155' : '#ffffff'),
                                        borderWidth: isCurrentChapter ? 0 : 1,
                                        borderColor: isDarkMode ? '#475569' : '#e2e8f0',
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: isCurrentChapter ? '#ffffff' : textColor,
                                    }}>
                                        {chapterNum}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <Pressable style={{ flex: 0.15 }} onPress={onClose} />
                
                <View style={{ 
                    flex: 0.85,
                    backgroundColor: bgColor, 
                    borderTopLeftRadius: 24, 
                    borderTopRightRadius: 24,
                }}>
                    {/* Handle */}
                    <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                        <View style={{ 
                            width: 40, 
                            height: 4, 
                            borderRadius: 2, 
                            backgroundColor: isDarkMode ? '#475569' : '#cbd5e1' 
                        }} />
                    </View>

                    {/* Header */}
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        paddingHorizontal: 20, 
                        paddingBottom: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: borderColor,
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: textColor }}>
                            Selecionar Capítulo
                        </Text>
                        <Pressable onPress={onClose} style={{ padding: 8, marginRight: -8 }}>
                            <X size={24} color={subtextColor} />
                        </Pressable>
                    </View>

                    {/* Lista de Livros */}
                    <FlatList
                        data={books}
                        renderItem={renderBook}
                        keyExtractor={(item) => item.abbrev}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                    />
                </View>
            </View>
        </Modal>
    );
}
