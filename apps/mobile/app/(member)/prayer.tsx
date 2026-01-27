import { View, Text, FlatList, Pressable, TextInput, Keyboard, RefreshControl } from 'react-native';
import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrayerRequestCard, CreatePrayerInput, useKeyboardAnimation } from '@/components/features/prayer';
import { useAuthStore } from '@/stores/authStore';
import { prayerService, PrayerRequest } from '@/services/prayer';
import { toast } from '@/lib/toast';

export default function PrayerScreen() {
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const { getCurrentTenant, user } = useAuthStore();
    const tenant = getCurrentTenant();
    const [showInput, setShowInput] = useState(false);
    const [newRequest, setNewRequest] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [category, setCategory] = useState('other');
    const inputRef = useRef<TextInput>(null);
    const keyboardHeight = useKeyboardAnimation(insets.bottom);

    const { data: requests, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['prayer', tenant?.id],
        queryFn: () => prayerService.getAll(tenant?.id || ''),
        enabled: !!tenant?.id,
        refetchOnWindowFocus: true,
    });

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Refetch when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const createMutation = useMutation({
        mutationFn: (content: string) =>
            prayerService.create(tenant?.id || '', { content, is_anonymous: isAnonymous, category }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer', tenant?.id] });
            setShowInput(false);
            setNewRequest('');
            setIsAnonymous(false);
            setCategory('other');
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

    const deleteMutation = useMutation({
        mutationFn: (requestId: string) => prayerService.delete(tenant?.id || '', requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer', tenant?.id] });
            toast.success('Pedido removido');
        },
        onError: () => toast.error('Erro ao remover pedido'),
    });

    const handleDelete = (requestId: string) => {
        deleteMutation.mutate(requestId);
    };

    if (isLoading) {
        return <LoadingScreen message="Carregando pedidos..." />;
    }

    const renderRequest = useCallback(({ item }: { item: PrayerRequest }) => {
        const isMyRequest = item.member_id === user?.id;
        const hasPrayed = user?.id ? item.prayed_by?.includes(user.id) : false;
        
        return (
            <PrayerRequestCard
                item={item}
                isMyRequest={isMyRequest}
                hasPrayed={hasPrayed}
                onPray={() => prayMutation.mutate(item.id)}
                onDelete={() => handleDelete(item.id)}
                isDeleting={deleteMutation.isPending}
            />
        );
    }, [user?.id, prayMutation, deleteMutation.isPending]);

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
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={onRefresh}
                            colors={['#10b981']}
                            tintColor="#10b981"
                        />
                    }
                />
            )}

            <CreatePrayerInput
                ref={inputRef}
                visible={showInput}
                keyboardHeight={keyboardHeight}
                content={newRequest}
                onContentChange={setNewRequest}
                category={category}
                onCategoryChange={setCategory}
                isAnonymous={isAnonymous}
                onAnonymousChange={setIsAnonymous}
                onSubmit={handleSubmit}
                onClose={handleCloseInput}
                isSubmitting={createMutation.isPending}
            />
        </View>
    );
}
