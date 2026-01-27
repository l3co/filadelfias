import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Calendar, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListCard } from '@/components/ui/ListCard';
import { useAuthStore } from '@/stores/authStore';
import { devotionalsService, Devotional } from '@/services/devotionals';
import { formatDate } from '@/lib/utils';

export default function DevotionalsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();

    const { data: devotionals, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['devotionals', tenant?.id],
        queryFn: () => devotionalsService.getAll(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    if (isLoading) {
        return <LoadingScreen message="Carregando devocionais..." />;
    }

    const renderDevotional = ({ item }: { item: Devotional }) => (
        <ListCard
            onPress={() => router.push(`/(member)/devotionals/${item.id}` as any)}
            style={{ flexDirection: 'row', alignItems: 'flex-start' }}
        >
            <View style={{ 
                height: 48, 
                width: 48, 
                borderRadius: 12, 
                backgroundColor: '#fef2f2', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <Heart size={24} color="#ef4444" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#10b981', marginTop: 4 }}>
                    {item.verse_reference}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Calendar size={14} color="#94a3b8" />
                    <Text style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
                        {formatDate(item.date)}
                    </Text>
                </View>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
        </ListCard>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
            {/* Header Premium */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 }}>
                    Devocionais
                </Text>
                <Text style={{ color: '#64748b', marginTop: 4 }}>
                    Reflexões diárias para sua vida espiritual
                </Text>
            </View>

            {devotionals?.length === 0 ? (
                <EmptyState
                    icon={Heart}
                    title="Nenhum devocional"
                    description="Os devocionais aparecerão aqui quando forem publicados."
                />
            ) : (
                <FlatList
                    data={devotionals}
                    renderItem={renderDevotional}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor="#10b981"
                        />
                    }
                />
            )}
        </View>
    );
}
