import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { eventsService, Event } from '@/services/events';
import { colors } from '@/constants/colors';

export default function EventsScreen() {
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();

    const { data: events, isLoading } = useQuery({
        queryKey: ['events', tenant?.id],
        queryFn: () => eventsService.getAll(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    if (isLoading) {
        return <LoadingScreen message="Carregando eventos..." />;
    }

    const renderEvent = ({ item }: { item: Event }) => (
        <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <View className="flex-row">
                {/* Data Box */}
                <View className="h-16 w-16 rounded-xl bg-orange-50 items-center justify-center mr-4">
                    <Text className="text-2xl font-bold text-orange-600">
                        {new Date(item.date).getDate()}
                    </Text>
                    <Text className="text-xs text-orange-500 uppercase">
                        {new Date(item.date).toLocaleDateString('pt-BR', { month: 'short' })}
                    </Text>
                </View>

                <View className="flex-1">
                    <Text className="font-semibold text-slate-900 text-base">{item.title}</Text>

                    {item.time && (
                        <View className="flex-row items-center mt-2">
                            <Clock size={14} color={colors.slate[400]} />
                            <Text className="text-sm text-slate-500 ml-1">{item.time}</Text>
                        </View>
                    )}

                    {item.location && (
                        <View className="flex-row items-center mt-1">
                            <MapPin size={14} color={colors.slate[400]} />
                            <Text className="text-sm text-slate-500 ml-1">{item.location}</Text>
                        </View>
                    )}
                </View>
            </View>

            {item.description && (
                <Text className="text-slate-600 mt-3" numberOfLines={2}>
                    {item.description}
                </Text>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Header title="Eventos" showBack showProfile />

            {events?.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="Nenhum evento"
                    description="Não há eventos agendados no momento."
                />
            ) : (
                <FlatList
                    data={events}
                    renderItem={renderEvent}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
