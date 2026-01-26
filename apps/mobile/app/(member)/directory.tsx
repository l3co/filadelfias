import { View, Text, FlatList, TextInput } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Mail, Phone, Users } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { membersService, Member } from '@/services/members';
import { colors } from '@/constants/colors';

export default function DirectoryScreen() {
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();
    const [search, setSearch] = useState('');

    const { data: members, isLoading } = useQuery({
        queryKey: ['members', tenant?.id],
        queryFn: () => membersService.getAll(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    const filteredMembers = members?.filter((m) =>
        m.full_name.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return <LoadingScreen message="Carregando membros..." />;
    }

    const renderMember = ({ item }: { item: Member }) => (
        <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <View className="flex-row items-center">
                <Avatar name={item.full_name} size="lg" />
                <View className="ml-3 flex-1">
                    <Text className="font-semibold text-slate-900">{item.full_name}</Text>
                    {item.email && (
                        <View className="flex-row items-center mt-1">
                            <Mail size={14} color={colors.slate[400]} />
                            <Text className="text-sm text-slate-500 ml-1">{item.email}</Text>
                        </View>
                    )}
                    {item.phone && (
                        <View className="flex-row items-center mt-1">
                            <Phone size={14} color={colors.slate[400]} />
                            <Text className="text-sm text-slate-500 ml-1">{item.phone}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Header title="Diretório" showBack showProfile />

            {/* Busca */}
            <View className="px-4 py-3 bg-white border-b border-slate-100">
                <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2">
                    <Search size={20} color={colors.slate[400]} />
                    <TextInput
                        placeholder="Buscar membro..."
                        value={search}
                        onChangeText={setSearch}
                        className="flex-1 ml-2 text-base"
                        placeholderTextColor={colors.slate[400]}
                    />
                </View>
            </View>

            {filteredMembers?.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="Nenhum membro encontrado"
                    description="Tente buscar por outro nome."
                />
            ) : (
                <FlatList
                    data={filteredMembers}
                    renderItem={renderMember}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text className="text-sm text-slate-500 mb-3">
                            {filteredMembers?.length || 0} membros encontrados
                        </Text>
                    }
                />
            )}
        </View>
    );
}
