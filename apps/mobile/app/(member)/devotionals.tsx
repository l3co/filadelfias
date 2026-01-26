import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Heart, Calendar, ChevronRight } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { devotionalsService, Devotional } from '@/services/devotionals';
import { formatDate } from '@/lib/utils';
import { colors } from '@/constants/colors';

export default function DevotionalsScreen() {
    const router = useRouter();
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
        <Pressable
            onPress={() => router.push(`/(member)/devotionals/${item.id}`)}
            className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 active:scale-[0.98]"
        >
            <View className="flex-row items-start">
                <View className="h-12 w-12 rounded-xl bg-red-50 items-center justify-center">
                    <Heart size={24} color={colors.error} />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="font-semibold text-slate-900 text-base" numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text className="text-sm text-emerald-600 mt-1">
                        {item.verse_reference}
                    </Text>
                    <View className="flex-row items-center mt-2">
                        <Calendar size={14} color={colors.slate[400]} />
                        <Text className="text-xs text-slate-400 ml-1">
                            {formatDate(item.date)}
                        </Text>
                    </View>
                </View>
                <ChevronRight size={20} color={colors.slate[300]} />
            </View>
        </Pressable>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Header title="Devocionais" showNotifications showProfile />

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
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={colors.primary[600]}
                        />
                    }
                />
            )}
        </View>
    );
}
