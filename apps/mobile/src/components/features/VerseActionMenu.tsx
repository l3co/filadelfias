import { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, Share, TextInput, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Copy, Share2, BookOpenText, Highlighter, Trash2, X, Volume2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { BibleHighlight, BibleNote } from '@/services/bible';

interface VerseActionMenuProps {
    visible: boolean;
    onClose: () => void;
    verse: string;
    verseNumber: number;
    bookName: string;
    chapter: number;
    version: string;
    isDarkMode: boolean;
    onSpeak: () => void;
    studyModeEnabled?: boolean;
    note?: BibleNote | null;
    highlight?: BibleHighlight | null;
    onSaveNote?: (content: string) => void;
    onDeleteNote?: () => void;
    onToggleHighlight?: (color: string) => void;
    onDeleteHighlight?: () => void;
    isSavingNote?: boolean;
    isDeletingNote?: boolean;
    isSavingHighlight?: boolean;
    isDeletingHighlight?: boolean;
}

export function VerseActionMenu({
    visible,
    onClose,
    verse,
    verseNumber,
    bookName,
    chapter,
    version,
    isDarkMode,
    onSpeak,
    studyModeEnabled = false,
    note,
    highlight,
    onSaveNote,
    onDeleteNote,
    onToggleHighlight,
    onDeleteHighlight,
    isSavingNote = false,
    isDeletingNote = false,
    isSavingHighlight = false,
    isDeletingHighlight = false,
}: VerseActionMenuProps) {
    const reference = `${bookName} ${chapter}:${verseNumber}`;
    const fullText = `"${verse}" - ${reference} (${version.toUpperCase()})`;
    const [noteContent, setNoteContent] = useState(note?.content ?? '');

    useEffect(() => {
        setNoteContent(note?.content ?? '');
    }, [note?.content, visible]);

    const handleCopy = async () => {
        await Clipboard.setStringAsync(fullText);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: fullText,
            });
        } catch (error) {
            console.error(error);
        }
        onClose();
    };

    const handleSpeak = () => {
        onSpeak();
        onClose();
    };

    const bgColor = isDarkMode ? 'bg-slate-800' : 'bg-white';
    const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
    const subtextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const borderColor = isDarkMode ? 'border-slate-700' : 'border-slate-100';
    const actionBg = isDarkMode ? 'bg-slate-700' : 'bg-slate-50';
    const inputBg = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
    const highlightOptions = [
        { label: 'Amarelo', value: 'yellow', color: '#facc15' },
        { label: 'Verde', value: 'green', color: '#4ade80' },
        { label: 'Azul', value: 'blue', color: '#60a5fa' },
        { label: 'Rosa', value: 'pink', color: '#f472b6' },
    ];

    const actions = [
        { icon: Copy, label: 'Copiar', onPress: handleCopy, color: colors.primary[500] },
        { icon: Share2, label: 'Compartilhar', onPress: handleShare, color: '#3b82f6' },
        { icon: Volume2, label: 'Ouvir', onPress: handleSpeak, color: '#8b5cf6' },
    ];

    const handleSaveNote = () => {
        onSaveNote?.(noteContent.trim());
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/50 justify-center items-center px-6"
                onPress={onClose}
            >
                <Pressable
                    className={`${bgColor} rounded-2xl w-full max-w-sm overflow-hidden`}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <View className={`px-5 pt-5 pb-4 border-b ${borderColor}`}>
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1 mr-4">
                                <Text className={`text-sm font-semibold ${subtextColor} mb-1`}>
                                    {reference}
                                </Text>
                                <Text 
                                    className={`${textColor} leading-6`}
                                    numberOfLines={4}
                                >
                                    "{verse}"
                                </Text>
                            </View>
                            <Pressable onPress={onClose} className="p-1 -mr-1 -mt-1">
                                <X size={20} color={isDarkMode ? colors.slate[400] : colors.slate[500]} />
                            </Pressable>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="p-4">
                        <View className="flex-row gap-3">
                            {actions.map((action) => (
                                <Pressable
                                    key={action.label}
                                    onPress={action.onPress}
                                    className={`flex-1 ${actionBg} rounded-xl py-4 items-center active:opacity-70`}
                                >
                                    <action.icon size={24} color={action.color} />
                                    <Text className={`text-xs font-medium mt-2 ${subtextColor}`}>
                                        {action.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {studyModeEnabled && (
                            <View className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <View className="flex-row items-center mb-3">
                                    <Highlighter size={18} color={highlight?.color === 'blue' ? '#60a5fa' : '#f59e0b'} />
                                    <Text className={`ml-2 font-semibold ${textColor}`}>
                                        Destaques
                                    </Text>
                                </View>

                                <View className="flex-row gap-2 mb-3">
                                    {highlightOptions.map((option) => {
                                        const isActive = highlight?.color === option.value;

                                        return (
                                            <Pressable
                                                key={option.value}
                                                onPress={() => onToggleHighlight?.(option.value)}
                                                className="flex-1 rounded-xl py-3 items-center border"
                                                disabled={isSavingHighlight || isDeletingHighlight}
                                                style={{
                                                    backgroundColor: isActive ? `${option.color}33` : 'transparent',
                                                    borderColor: isActive ? option.color : (isDarkMode ? '#334155' : '#cbd5e1'),
                                                    opacity: isSavingHighlight || isDeletingHighlight ? 0.6 : 1,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 18,
                                                        height: 18,
                                                        borderRadius: 999,
                                                        backgroundColor: option.color,
                                                        marginBottom: 6,
                                                    }}
                                                />
                                                <Text className={`text-xs font-medium ${subtextColor}`}>
                                                    {option.label}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                {highlight && (
                                    <Pressable
                                        onPress={onDeleteHighlight}
                                        className={`flex-row items-center justify-center rounded-xl py-3 mb-4 ${actionBg}`}
                                        disabled={isDeletingHighlight}
                                    >
                                        {isDeletingHighlight ? (
                                            <ActivityIndicator size="small" color="#ef4444" />
                                        ) : (
                                            <>
                                                <Trash2 size={16} color="#ef4444" />
                                                <Text className="ml-2 text-red-500 font-medium">
                                                    Remover destaque
                                                </Text>
                                            </>
                                        )}
                                    </Pressable>
                                )}

                                <View className="flex-row items-center mb-3">
                                    <BookOpenText size={18} color="#10b981" />
                                    <Text className={`ml-2 font-semibold ${textColor}`}>
                                        Anotação privada
                                    </Text>
                                </View>

                                <TextInput
                                    value={noteContent}
                                    onChangeText={setNoteContent}
                                    multiline
                                    placeholder="Escreva sua reflexão para este versículo"
                                    placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                                    className={`${inputBg} ${textColor} rounded-xl px-4 py-3 min-h-[110px]`}
                                    textAlignVertical="top"
                                />

                                <View className="flex-row gap-3 mt-3">
                                    <Pressable
                                        onPress={handleSaveNote}
                                        className="flex-1 rounded-xl py-3 items-center"
                                        style={{ backgroundColor: '#10b981', opacity: isSavingNote ? 0.7 : 1 }}
                                        disabled={isSavingNote || noteContent.trim().length === 0}
                                    >
                                        {isSavingNote ? (
                                            <ActivityIndicator size="small" color="#ffffff" />
                                        ) : (
                                            <Text className="text-white font-semibold">
                                                {note ? 'Atualizar' : 'Salvar'}
                                            </Text>
                                        )}
                                    </Pressable>

                                    {note && (
                                        <Pressable
                                            onPress={onDeleteNote}
                                            className={`flex-1 rounded-xl py-3 items-center ${actionBg}`}
                                            disabled={isDeletingNote}
                                        >
                                            {isDeletingNote ? (
                                                <ActivityIndicator size="small" color="#ef4444" />
                                            ) : (
                                                <Text className="text-red-500 font-semibold">
                                                    Excluir
                                                </Text>
                                            )}
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
