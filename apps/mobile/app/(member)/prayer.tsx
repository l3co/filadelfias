import { View, Text, FlatList, Pressable, Modal, TextInput, StatusBar, Platform } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Plus, Heart, X, Send } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { prayerService, PrayerRequest } from '@/services/prayer';
import { formatDate } from '@/lib/utils';
import { toast } from '@/lib/toast';

export default function PrayerScreen() {
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRequest, setNewRequest] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

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
            setIsModalOpen(false);
            setNewRequest('');
            toast.success('Pedido enviado!');
        },
        onError: () => toast.error('Erro ao enviar pedido'),
    });

    const prayMutation = useMutation({
        mutationFn: (requestId: string) => prayerService.pray(tenant?.id || '', requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer', tenant?.id] });
        },
    });

    if (isLoading) {
        return <LoadingScreen message="Carregando pedidos..." />;
    }

    const renderRequest = ({ item }: { item: PrayerRequest }) => (
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ 
                    height: 40, 
                    width: 40, 
                    borderRadius: 20, 
                    backgroundColor: '#fdf2f8', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <MessageCircle size={20} color="#ec4899" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontSize: 14, color: '#64748b' }}>
                        {item.is_anonymous ? 'Anônimo' : item.author_name}
                    </Text>
                    <Text style={{ color: '#1e293b', marginTop: 4, lineHeight: 22 }}>{item.content}</Text>
                    <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{formatDate(item.created_at)}</Text>
                </View>
            </View>

            <Pressable
                onPress={() => prayMutation.mutate(item.id)}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 12,
                    paddingVertical: 10,
                    backgroundColor: '#fdf2f8',
                    borderRadius: 12,
                }}
            >
                <Heart
                    size={18}
                    color="#ec4899"
                    fill={item.prayed_by_me ? '#ec4899' : 'transparent'}
                />
                <Text style={{ color: '#db2777', fontWeight: '500', marginLeft: 8 }}>
                    {item.prayer_count} {item.prayer_count === 1 ? 'oração' : 'orações'}
                </Text>
            </Pressable>
        </View>
    );

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
                    onPress={() => setIsModalOpen(true)}
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

            {requests?.length === 0 ? (
                <EmptyState
                    icon={MessageCircle}
                    title="Nenhum pedido"
                    description="Seja o primeiro a compartilhar um pedido de oração."
                    action={
                        <Button onPress={() => setIsModalOpen(true)}>
                            Novo Pedido
                        </Button>
                    }
                />
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequest}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Modal de Novo Pedido */}
            <Modal
                visible={isModalOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsModalOpen(false)}
            >
                <View style={{ 
                    flex: 1, 
                    backgroundColor: '#ffffff',
                    paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : insets.top + 8,
                }}>
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        paddingHorizontal: 16, 
                        paddingBottom: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f1f5f9',
                    }}>
                        <Pressable onPress={() => setIsModalOpen(false)} style={{ padding: 8 }}>
                            <X size={24} color="#64748b" />
                        </Pressable>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>Novo Pedido</Text>
                        <Pressable
                            onPress={() => createMutation.mutate(newRequest)}
                            disabled={!newRequest.trim() || createMutation.isPending}
                            style={{ padding: 8 }}
                        >
                            <Send size={24} color={newRequest.trim() ? '#10b981' : '#cbd5e1'} />
                        </Pressable>
                    </View>

                    <View style={{ padding: 20, flex: 1 }}>
                        <TextInput
                            placeholder="Compartilhe seu pedido de oração..."
                            value={newRequest}
                            onChangeText={setNewRequest}
                            multiline
                            numberOfLines={6}
                            style={{ fontSize: 16, color: '#1e293b', lineHeight: 24 }}
                            placeholderTextColor="#94a3b8"
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={{ 
                        padding: 20, 
                        borderTopWidth: 1, 
                        borderTopColor: '#f1f5f9',
                        paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
                    }}>
                        <Pressable
                            onPress={() => setIsAnonymous(!isAnonymous)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View style={{
                                height: 22,
                                width: 22,
                                borderRadius: 4,
                                borderWidth: 2,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isAnonymous ? '#10b981' : 'transparent',
                                borderColor: isAnonymous ? '#10b981' : '#cbd5e1',
                            }}>
                                {isAnonymous && <Text style={{ color: '#ffffff', fontSize: 12 }}>✓</Text>}
                            </View>
                            <Text style={{ marginLeft: 10, color: '#475569' }}>Enviar anonimamente</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
