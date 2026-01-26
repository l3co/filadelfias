import { View, Text, Pressable, Modal, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Copy, Share2, BookmarkPlus, X, Volume2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';

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
}: VerseActionMenuProps) {
    const reference = `${bookName} ${chapter}:${verseNumber}`;
    const fullText = `"${verse}" - ${reference} (${version.toUpperCase()})`;

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

    const actions = [
        { icon: Copy, label: 'Copiar', onPress: handleCopy, color: colors.primary[500] },
        { icon: Share2, label: 'Compartilhar', onPress: handleShare, color: '#3b82f6' },
        { icon: Volume2, label: 'Ouvir', onPress: handleSpeak, color: '#8b5cf6' },
    ];

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
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
