import { View, Text, FlatList, Pressable, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Plus, Heart, X, Send } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { prayerService, PrayerRequest } from '@/services/prayer';
import { formatDate } from '@/lib/utils';
import { colors } from '@/constants/colors';
import { toast } from '@/lib/toast';

export default function PrayerScreen() {
    const queryClient = useQueryClient();
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRequest, setNewRequest] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

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
        <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <View className="flex-row items-start">
                <View className="h-10 w-10 rounded-full bg-pink-50 items-center justify-center">
                    <MessageCircle size={20} color="#ec4899" />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-sm text-slate-500">
                        {item.is_anonymous ? 'Anônimo' : item.author_name}
                    </Text>
                    <Text className="text-slate-800 mt-1">{item.content}</Text>
                    <Text className="text-xs text-slate-400 mt-2">{formatDate(item.created_at)}</Text>
                </View>
            </View>

            <Pressable
                onPress={() => prayMutation.mutate(item.id)}
                className="flex-row items-center justify-center mt-3 py-2 bg-pink-50 rounded-xl"
            >
                <Heart
                    size={18}
                    color="#ec4899"
                    fill={item.prayed_by_me ? '#ec4899' : 'transparent'}
                />
                <Text className="text-pink-600 font-medium ml-2">
                    {item.prayer_count} {item.prayer_count === 1 ? 'oração' : 'orações'}
                </Text>
            </Pressable>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Header
                title="Pedidos de Oração"
                rightAction={
                    <Pressable
                        onPress={() => setIsModalOpen(true)}
                        className="h-9 w-9 rounded-xl bg-emerald-100 items-center justify-center"
                    >
                        <Plus size={20} color={colors.primary[600]} />
                    </Pressable>
                }
            />

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
                    contentContainerStyle={{ padding: 16 }}
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
                <View className="flex-1 bg-white">
                    <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
                        <Pressable onPress={() => setIsModalOpen(false)}>
                            <X size={24} color={colors.slate[600]} />
                        </Pressable>
                        <Text className="text-lg font-bold text-slate-900">Novo Pedido</Text>
                        <Pressable
                            onPress={() => createMutation.mutate(newRequest)}
                            disabled={!newRequest.trim() || createMutation.isPending}
                        >
                            <Send size={24} color={newRequest.trim() ? colors.primary[600] : colors.slate[300]} />
                        </Pressable>
                    </View>

                    <View className="p-4 flex-1">
                        <TextInput
                            placeholder="Compartilhe seu pedido de oração..."
                            value={newRequest}
                            onChangeText={setNewRequest}
                            multiline
                            numberOfLines={6}
                            className="text-lg text-slate-800 leading-7"
                            placeholderTextColor={colors.slate[400]}
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="p-4 border-t border-slate-100">
                        <Pressable
                            onPress={() => setIsAnonymous(!isAnonymous)}
                            className="flex-row items-center"
                        >
                            <View className={`h-5 w-5 rounded border-2 items-center justify-center ${isAnonymous ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                {isAnonymous && <Text className="text-white text-xs">✓</Text>}
                            </View>
                            <Text className="ml-2 text-slate-700">Enviar anonimamente</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
