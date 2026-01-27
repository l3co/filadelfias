import { View, Text, Pressable, TextInput, ScrollView, Animated } from 'react-native';
import { forwardRef } from 'react';
import { X, Send } from 'lucide-react-native';
import { CATEGORY_LABELS } from './PrayerRequestCard';

interface CreatePrayerInputProps {
    visible: boolean;
    keyboardHeight: Animated.Value;
    content: string;
    onContentChange: (text: string) => void;
    category: string;
    onCategoryChange: (category: string) => void;
    isAnonymous: boolean;
    onAnonymousChange: (value: boolean) => void;
    onSubmit: () => void;
    onClose: () => void;
    isSubmitting: boolean;
}

export const CreatePrayerInput = forwardRef<TextInput, CreatePrayerInputProps>(
    function CreatePrayerInput(
        {
            visible,
            keyboardHeight,
            content,
            onContentChange,
            category,
            onCategoryChange,
            isAnonymous,
            onAnonymousChange,
            onSubmit,
            onClose,
            isSubmitting,
        },
        ref
    ) {
        if (!visible) return null;

        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: keyboardHeight,
                    left: 0,
                    right: 0,
                }}
            >
                <Pressable 
                    onPress={onClose}
                    style={{
                        position: 'absolute',
                        top: -1000,
                        left: 0,
                        right: 0,
                        height: 1000,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                    }}
                />
                <View style={{
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    paddingTop: 12,
                    paddingHorizontal: 16,
                    paddingBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 20,
                }}>
                    {/* Header com fechar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Novo pedido de oração</Text>
                        <Pressable onPress={onClose} style={{ padding: 4 }}>
                            <X size={20} color="#94a3b8" />
                        </Pressable>
                    </View>

                    {/* Seletor de categoria */}
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 10 }}
                        contentContainerStyle={{ gap: 6 }}
                    >
                        {Object.entries(CATEGORY_LABELS).map(([key, { label, bg, text }]) => (
                            <Pressable
                                key={key}
                                onPress={() => onCategoryChange(key)}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 14,
                                    backgroundColor: category === key ? bg : '#f1f5f9',
                                    borderWidth: category === key ? 1 : 0,
                                    borderColor: text,
                                }}
                            >
                                <Text style={{ 
                                    fontSize: 12, 
                                    fontWeight: '500', 
                                    color: category === key ? text : '#94a3b8' 
                                }}>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* Checkbox anônimo */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Pressable
                            onPress={() => onAnonymousChange(!isAnonymous)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View style={{
                                height: 18,
                                width: 18,
                                borderRadius: 4,
                                borderWidth: 2,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isAnonymous ? '#10b981' : 'transparent',
                                borderColor: isAnonymous ? '#10b981' : '#cbd5e1',
                            }}>
                                {isAnonymous && <Text style={{ color: '#ffffff', fontSize: 10 }}>✓</Text>}
                            </View>
                            <Text style={{ marginLeft: 8, color: '#64748b', fontSize: 13 }}>Publicar anonimamente</Text>
                        </Pressable>
                    </View>

                    {/* Input com botão de enviar */}
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'flex-end',
                        backgroundColor: '#f8fafc',
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                    }}>
                        <TextInput
                            ref={ref}
                            placeholder="Compartilhe seu pedido de oração..."
                            value={content}
                            onChangeText={onContentChange}
                            onSubmitEditing={onSubmit}
                            multiline
                            maxLength={500}
                            style={{ 
                                flex: 1, 
                                fontSize: 15, 
                                color: '#1e293b', 
                                lineHeight: 22,
                                maxHeight: 100,
                                paddingTop: 0,
                                paddingBottom: 0,
                            }}
                            placeholderTextColor="#94a3b8"
                            textAlignVertical="top"
                            blurOnSubmit={false}
                        />
                        <Pressable
                            onPress={onSubmit}
                            disabled={!content.trim() || isSubmitting}
                            style={{
                                marginLeft: 10,
                                height: 36,
                                width: 36,
                                borderRadius: 18,
                                backgroundColor: content.trim() ? '#10b981' : '#e2e8f0',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Send size={18} color={content.trim() ? '#ffffff' : '#94a3b8'} />
                        </Pressable>
                    </View>
                </View>
            </Animated.View>
        );
    }
);
