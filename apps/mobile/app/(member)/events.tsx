import { View, Text, FlatList, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, MapPin, Clock, ChevronLeft } from 'lucide-react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { eventsService, Event } from '@/services/events';

export default function EventsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
            <View style={{ flexDirection: 'row' }}>
                {/* Data Box */}
                <View style={{ 
                    height: 64, 
                    width: 64, 
                    borderRadius: 12, 
                    backgroundColor: '#fff7ed', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: 16,
                }}>
                    <Text style={{ fontSize: 24, fontWeight: '700', color: '#f97316' }}>
                        {new Date(item.date).getDate()}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#fb923c', textTransform: 'uppercase' }}>
                        {new Date(item.date).toLocaleDateString('pt-BR', { month: 'short' })}
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 15 }}>{item.title}</Text>

                    {item.time && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <Clock size={14} color="#94a3b8" />
                            <Text style={{ fontSize: 14, color: '#64748b', marginLeft: 6 }}>{item.time}</Text>
                        </View>
                    )}

                    {item.location && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <MapPin size={14} color="#94a3b8" />
                            <Text style={{ fontSize: 14, color: '#64748b', marginLeft: 6 }}>{item.location}</Text>
                        </View>
                    )}
                </View>
            </View>

            {item.description && (
                <Text style={{ color: '#475569', marginTop: 12, lineHeight: 20 }} numberOfLines={2}>
                    {item.description}
                </Text>
            )}
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
            {/* Header Premium */}
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                paddingHorizontal: 16, 
                paddingTop: 16, 
                paddingBottom: 16 
            }}>
                <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
                    <ChevronLeft size={24} color="#475569" />
                </Pressable>
                <View style={{ marginLeft: 8 }}>
                    <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>
                        Eventos
                    </Text>
                    <Text style={{ color: '#64748b', marginTop: 2 }}>
                        Próximas atividades da igreja
                    </Text>
                </View>
            </View>

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
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
