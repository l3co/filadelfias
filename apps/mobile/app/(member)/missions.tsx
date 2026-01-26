import { View, Text, FlatList, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Globe, MapPin, Calendar } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { missionsService, Missionary } from '@/services/missions';
import { formatDate } from '@/lib/utils';
import { colors } from '@/constants/colors';

export default function MissionsScreen() {
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();

    const { data: missionaries, isLoading } = useQuery({
        queryKey: ['missions', tenant?.id],
        queryFn: () => missionsService.getAll(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    if (isLoading) {
        return <LoadingScreen message="Carregando missionários..." />;
    }

    const renderMissionary = ({ item }: { item: Missionary }) => (
        <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <View className="flex-row items-start">
                {item.photo_url ? (
                    <Image
                        source={{ uri: item.photo_url }}
                        className="h-16 w-16 rounded-xl"
                    />
                ) : (
                    <Avatar name={item.name} size="xl" />
                )}

                <View className="ml-4 flex-1">
                    <View className="flex-row items-center">
                        <Text className="font-bold text-slate-900 text-lg">{item.name}</Text>
                        {item.is_active && (
                            <View className="ml-2 px-2 py-0.5 bg-emerald-100 rounded-full">
                                <Text className="text-xs text-emerald-700 font-medium">Ativo</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row items-center mt-2">
                        <MapPin size={14} color={colors.slate[400]} />
                        <Text className="text-sm text-slate-600 ml-1">{item.field}, {item.country}</Text>
                    </View>

                    <View className="flex-row items-center mt-1">
                        <Calendar size={14} color={colors.slate[400]} />
                        <Text className="text-sm text-slate-500 ml-1">
                            Desde {formatDate(item.start_date)}
                        </Text>
                    </View>
                </View>
            </View>

            {item.description && (
                <Text className="text-slate-600 mt-3 leading-5" numberOfLines={3}>
                    {item.description}
                </Text>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Header title="Missões" showBack showProfile />

            {missionaries?.length === 0 ? (
                <EmptyState
                    icon={Globe}
                    title="Nenhum missionário"
                    description="Os missionários da igreja aparecerão aqui."
                />
            ) : (
                <FlatList
                    data={missionaries}
                    renderItem={renderMissionary}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View className="bg-indigo-50 rounded-xl p-4 mb-4 border border-indigo-100">
                            <View className="flex-row items-center">
                                <Globe size={24} color="#6366f1" />
                                <View className="ml-3">
                                    <Text className="font-semibold text-indigo-800">
                                        {missionaries?.length || 0} Missionários
                                    </Text>
                                    <Text className="text-sm text-indigo-600">
                                        Levando o evangelho ao mundo
                                    </Text>
                                </View>
                            </View>
                        </View>
                    }
                />
            )}
        </View>
    );
}
