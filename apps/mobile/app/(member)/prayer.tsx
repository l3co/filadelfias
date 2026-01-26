import { View, Text, FlatList, Pressable, TextInput, Keyboard, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Plus, Heart, Send, Clock, User, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { prayerService, PrayerRequest } from '@/services/prayer';
import { toast } from '@/lib/toast';

const CATEGORY_LABELS: Record<string, { label: string; bg: string; text: string }> = {
    health: { label: 'Saúde', bg: '#fef2f2', text: '#b91c1c' },
    family: { label: 'Família', bg: '#eff6ff', text: '#1d4ed8' },
    work: { label: 'Trabalho', bg: '#fffbeb', text: '#b45309' },
    spiritual: { label: 'Espiritual', bg: '#f5f3ff', text: '#7c3aed' },
    other: { label: 'Outros', bg: '#f3f4f6', text: '#374151' },
};

const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora há pouco';
    if (diffHours < 24) return `Há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    return `Há ${diffDays} dias`;
};

export default function PrayerScreen() {
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();
    const [showInput, setShowInput] = useState(false);
    const [newRequest, setNewRequest] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const keyboardHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                // No Android, subtrair insets.bottom e um offset para ajustar posição
                const height = Platform.OS === 'android' 
                    ? e.endCoordinates.height - insets.bottom - 32
                    : e.endCoordinates.height;
                Animated.timing(keyboardHeight, {
                    toValue: Math.max(0, height),
                    duration: Platform.OS === 'ios' ? 250 : 50,
                    useNativeDriver: false,
                }).start();
            }
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(keyboardHeight, {
                    toValue: 0,
                    duration: Platform.OS === 'ios' ? 250 : 50,
                    useNativeDriver: false,
                }).start();
            }
        );
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [insets.bottom]);

    const { data: requests, isLoading } = useQuery({
        queryKey: ['prayer', tenant?.id],
        queryFn: () => prayerService.getAll(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    const createMutation = useMutation({
        mutationFn: (content: string) =>
            prayerService.create(tenant?.id || '', { content, is_anonymous: isAnonymous }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer', tenant?.id] });
            setShowInput(false);
            setNewRequest('');
            setIsAnonymous(false);
            Keyboard.dismiss();
            toast.success('Pedido enviado!');
        },
        onError: () => toast.error('Erro ao enviar pedido'),
    });

    const handleOpenInput = () => {
        setShowInput(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleCloseInput = () => {
        setShowInput(false);
        setNewRequest('');
        Keyboard.dismiss();
    };

    const handleSubmit = () => {
        if (newRequest.trim()) {
            createMutation.mutate(newRequest.trim());
        }
    };

    const prayMutation = useMutation({
        mutationFn: (requestId: string) => prayerService.pray(tenant?.id || '', requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer', tenant?.id] });
        },
    });

    if (isLoading) {
        return <LoadingScreen message="Carregando pedidos..." />;
    }

    const renderRequest = ({ item }: { item: PrayerRequest }) => {
        const category = CATEGORY_LABELS[(item as any).category] || CATEGORY_LABELS.other;
        
        return (
            <View style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
            }}>
                {/* Header com avatar, nome e categoria */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ 
                            height: 36, 
                            width: 36, 
                            borderRadius: 18, 
                            backgroundColor: '#f1f5f9', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <User size={18} color="#64748b" />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 15, fontWeight: '500', color: '#0f172a' }}>
                                {item.is_anonymous ? 'Anônimo' : item.author_name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                <Clock size={12} color="#94a3b8" />
                                <Text style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
                                    {formatRelativeDate(item.created_at)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    
                    {/* Badge de categoria */}
                    <View style={{ 
                        backgroundColor: category.bg, 
                        paddingHorizontal: 10, 
                        paddingVertical: 4, 
                        borderRadius: 12 
                    }}>
                        <Text style={{ fontSize: 11, fontWeight: '500', color: category.text }}>
                            {category.label}
                        </Text>
                    </View>
                </View>

                {/* Conteúdo do pedido */}
                <Text style={{ color: '#374151', lineHeight: 22, marginBottom: 14 }}>
                    {item.content}
                </Text>

                {/* Footer com contador e botão */}
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                }}>
                    <Text style={{ fontSize: 13, color: '#64748b' }}>
                        {item.prayer_count} {item.prayer_count === 1 ? 'pessoa orou' : 'pessoas oraram'}
                    </Text>
                    
                    <Pressable
                        onPress={() => prayMutation.mutate(item.id)}
                        disabled={item.prayed_by_me}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            backgroundColor: item.prayed_by_me ? '#10b981' : '#ffffff',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: item.prayed_by_me ? '#10b981' : '#e2e8f0',
                        }}
                    >
                        <Heart
                            size={16}
                            color={item.prayed_by_me ? '#ffffff' : '#64748b'}
                            fill={item.prayed_by_me ? '#ffffff' : 'transparent'}
                        />
                        <Text style={{ 
                            fontSize: 13, 
                            fontWeight: '500', 
                            marginLeft: 6,
                            color: item.prayed_by_me ? '#ffffff' : '#374151',
                        }}>
                            {item.prayed_by_me ? 'Orei!' : 'Orar'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
            {/* Header Premium */}
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingHorizontal: 20, 
                paddingTop: 16, 
                paddingBottom: 16 
            }}>
                <View>
                    <Text style={{ fontSize: 28, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 }}>
                        Pedidos de Oração
                    </Text>
                    <Text style={{ color: '#64748b', marginTop: 4 }}>
                        Ore pelos irmãos da igreja
                    </Text>
                </View>
                <Pressable
                    onPress={handleOpenInput}
                    style={{
                        height: 44,
                        width: 44,
                        borderRadius: 12,
                        backgroundColor: '#ecfdf5',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Plus size={22} color="#10b981" />
                </Pressable>
            </View>

            {/* Banner com versículo */}
            <View style={{
                marginHorizontal: 16,
                marginBottom: 16,
                backgroundColor: '#eff6ff',
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: '#dbeafe',
            }}>
                <Text style={{ fontSize: 13, color: '#1d4ed8', lineHeight: 20 }}>
                    <Text style={{ fontWeight: '600' }}>Lembre-se: </Text>
                    "Confessem os seus pecados uns aos outros e orem uns pelos outros para serem curados. A oração de um justo é poderosa e eficaz." - Tiago 5:16
                </Text>
            </View>

            {requests?.length === 0 ? (
                <EmptyState
                    icon={MessageCircle}
                    title="Nenhum pedido"
                    description="Seja o primeiro a compartilhar um pedido de oração."
                    action={
                        <Button onPress={handleOpenInput}>
                            Novo Pedido
                        </Button>
                    }
                />
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequest}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: showInput ? 140 : 24 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Input Inline para Novo Pedido */}
            {showInput && (
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: keyboardHeight,
                        left: 0,
                        right: 0,
                    }}
                >
                    <Pressable 
                        onPress={handleCloseInput}
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
                        {/* Header com opções */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Pressable
                                onPress={() => setIsAnonymous(!isAnonymous)}
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
                                <Text style={{ marginLeft: 8, color: '#64748b', fontSize: 13 }}>Anônimo</Text>
                            </Pressable>
                            
                            <Pressable onPress={handleCloseInput} style={{ padding: 4 }}>
                                <X size={20} color="#94a3b8" />
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
                                ref={inputRef}
                                placeholder="Compartilhe seu pedido de oração..."
                                value={newRequest}
                                onChangeText={setNewRequest}
                                onSubmitEditing={handleSubmit}
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
                                onPress={handleSubmit}
                                disabled={!newRequest.trim() || createMutation.isPending}
                                style={{
                                    marginLeft: 10,
                                    height: 36,
                                    width: 36,
                                    borderRadius: 18,
                                    backgroundColor: newRequest.trim() ? '#10b981' : '#e2e8f0',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Send size={18} color={newRequest.trim() ? '#ffffff' : '#94a3b8'} />
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}
