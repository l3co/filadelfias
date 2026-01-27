import { View, Text, FlatList, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { GraduationCap, Users, Clock, MapPin, ChevronRight, BookOpen } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListCard } from '@/components/ui/ListCard';
import { useAuthStore } from '@/stores/authStore';
import { ebdService, EBDClass } from '@/services/ebd';
import { colors } from '@/constants/colors';

export default function EBDScreen() {
    const router = useRouter();
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();

    const { data: myClass, isLoading: isLoadingMyClass } = useQuery({
        queryKey: ['ebd', 'my-class', tenant?.id],
        queryFn: () => ebdService.getMyClass(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    const { data: classes, isLoading: isLoadingClasses } = useQuery({
        queryKey: ['ebd', 'classes', tenant?.id],
        queryFn: () => ebdService.getClasses(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    const isLoading = isLoadingMyClass || isLoadingClasses;

    if (isLoading) {
        return <LoadingScreen message="Carregando EBD..." />;
    }

    const renderClass = ({ item }: { item: EBDClass }) => (
        <ListCard onPress={() => router.push(`/(member)/ebd/${item.id}`)}>
            <View className="flex-row items-start">
                <View className="h-12 w-12 rounded-xl bg-yellow-50 items-center justify-center">
                    <GraduationCap size={24} color="#eab308" />
                </View>

                <View className="ml-3 flex-1">
                    <Text className="font-semibold text-slate-900">{item.name}</Text>
                    <Text className="text-sm text-slate-500">{item.teacher_name}</Text>

                    <View className="flex-row items-center mt-2 gap-4">
                        <View className="flex-row items-center">
                            <Users size={14} color={colors.slate[400]} />
                            <Text className="text-xs text-slate-400 ml-1">{item.students_count} alunos</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Clock size={14} color={colors.slate[400]} />
                            <Text className="text-xs text-slate-400 ml-1">{item.schedule}</Text>
                        </View>
                    </View>
                </View>

                <ChevronRight size={20} color={colors.slate[300]} />
            </View>
        </ListCard>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Header title="Escola Bíblica" showBack showProfile />

            <FlatList
                data={classes}
                renderItem={renderClass}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        {/* Minha Turma */}
                        {myClass && (
                            <Pressable
                                onPress={() => router.push(`/(member)/ebd/${myClass.id}`)}
                                className="bg-yellow-50 rounded-2xl p-4 mb-4 border border-yellow-200"
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <BookOpen size={24} color="#eab308" />
                                        <View className="ml-3">
                                            <Text className="text-xs text-yellow-700 uppercase font-medium">Minha Turma</Text>
                                            <Text className="font-bold text-yellow-800 text-lg">{myClass.name}</Text>
                                            <Text className="text-sm text-yellow-700">{myClass.teacher_name}</Text>
                                        </View>
                                    </View>
                                    <ChevronRight size={24} color="#eab308" />
                                </View>
                            </Pressable>
                        )}

                        <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                            Todas as Turmas
                        </Text>
                    </>
                }
                ListEmptyComponent={
                    <EmptyState
                        icon={GraduationCap}
                        title="Nenhuma turma"
                        description="As turmas da EBD aparecerão aqui."
                    />
                }
            />
        </View>
    );
}
