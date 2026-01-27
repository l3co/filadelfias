import { View, Text, FlatList, TextInput, ScrollView, Pressable } from 'react-native';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Mail, Phone, Users, Filter } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListCard } from '@/components/ui/ListCard';
import { useAuthStore } from '@/stores/authStore';
import { membersService, Member } from '@/services/members';
import { useOfficeOptions, useEnumLabelsMap } from '@/hooks/useMetadata';
import { getOfficeTheme } from '@/constants/offices';
import { colors } from '@/constants/colors';

export default function DirectoryScreen() {
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();
    const [search, setSearch] = useState('');
    const [officeFilter, setOfficeFilter] = useState<string>('all');

    // Dados da API - fonte única de verdade
    const officeOptions = useOfficeOptions();
    const officeLabelsMap = useEnumLabelsMap('ecclesiastical_offices');

    const { data: members, isLoading } = useQuery({
        queryKey: ['members', tenant?.id],
        queryFn: () => membersService.getAll(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    // Monta filtros dinamicamente a partir da API
    const officeFilters = useMemo(() => {
        const allFilter = { value: 'all', label: 'Todos' };
        const apiFilters = officeOptions.map(opt => ({
            value: opt.value,
            label: opt.label + 's', // Pluraliza (Pastor -> Pastores)
        }));
        return [allFilter, ...apiFilters];
    }, [officeOptions]);

    const filteredMembers = useMemo(() => {
        return members?.filter((m) => {
            const matchesSearch = m.full_name.toLowerCase().includes(search.toLowerCase());
            const memberOffice = m.office || 'MEMBRO';
            const matchesOffice = officeFilter === 'all' || memberOffice === officeFilter;
            return matchesSearch && matchesOffice;
        });
    }, [members, search, officeFilter]);

    const officeCounts = useMemo(() => {
        const counts: Record<string, number> = { all: members?.length || 0 };
        members?.forEach(m => {
            const office = m.office || 'MEMBRO';
            counts[office] = (counts[office] || 0) + 1;
        });
        return counts;
    }, [members]);

    if (isLoading) {
        return <LoadingScreen message="Carregando membros..." />;
    }

    const renderMember = ({ item }: { item: Member }) => {
        const theme = getOfficeTheme(item.office);
        const officeLabel = officeLabelsMap[item.office || 'MEMBRO'] || 'Membro';
        
        return (
            <ListCard>
                <View className="flex-row items-start">
                    <View 
                        style={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: 14, 
                            backgroundColor: theme.gradient[0],
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 20 }}>
                            {item.full_name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="font-semibold text-slate-900 text-base">{item.full_name}</Text>
                        <View 
                            style={{ 
                                backgroundColor: theme.bg, 
                                paddingHorizontal: 10, 
                                paddingVertical: 4, 
                                borderRadius: 8,
                                alignSelf: 'flex-start',
                                marginTop: 4,
                            }}
                        >
                            <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>
                                {officeLabel}
                            </Text>
                        </View>
                    </View>
                </View>
                
                {(item.email || item.phone) && (
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                        {item.phone && (
                            <View className="flex-row items-center mb-1">
                                <Phone size={14} color={colors.slate[400]} />
                                <Text className="text-sm text-slate-500 ml-2">{item.phone}</Text>
                            </View>
                        )}
                        {item.email && (
                            <View className="flex-row items-center">
                                <Mail size={14} color={colors.slate[400]} />
                                <Text className="text-sm text-slate-500 ml-2">{item.email}</Text>
                            </View>
                        )}
                    </View>
                )}
            </ListCard>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Header title="Diretório" showBack showProfile />

            {/* Search & Filters */}
            <View className="bg-white border-b border-slate-100 px-4 py-3">
                {/* Busca */}
                <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2.5 mb-3">
                    <Search size={20} color={colors.slate[400]} />
                    <TextInput
                        placeholder="Buscar por nome..."
                        value={search}
                        onChangeText={setSearch}
                        className="flex-1 ml-2 text-base"
                        placeholderTextColor={colors.slate[400]}
                    />
                </View>

                {/* Filtros por Cargo */}
                <View className="flex-row items-center">
                    <Filter size={16} color={colors.slate[400]} style={{ marginRight: 8 }} />
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8 }}
                    >
                        {officeFilters.map((filter) => {
                            const isActive = officeFilter === filter.value;
                            const count = officeCounts[filter.value] || 0;
                            const theme = filter.value === 'all' 
                                ? { bg: '#f1f5f9', text: '#475569' } 
                                : getOfficeTheme(filter.value);
                            
                            return (
                                <Pressable
                                    key={filter.value}
                                    onPress={() => setOfficeFilter(filter.value)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 14,
                                        paddingVertical: 8,
                                        borderRadius: 10,
                                        backgroundColor: isActive ? theme.bg : '#f8fafc',
                                        borderWidth: isActive ? 1.5 : 1,
                                        borderColor: isActive ? theme.text + '40' : '#e2e8f0',
                                    }}
                                >
                                    <Text 
                                        style={{ 
                                            fontWeight: '600', 
                                            fontSize: 13,
                                            color: isActive ? theme.text : '#64748b',
                                        }}
                                    >
                                        {filter.label}
                                    </Text>
                                    <View 
                                        style={{ 
                                            marginLeft: 6, 
                                            backgroundColor: isActive ? '#ffffff80' : '#e2e8f0',
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 6,
                                        }}
                                    >
                                        <Text style={{ fontSize: 11, fontWeight: '600', color: isActive ? theme.text : '#94a3b8' }}>
                                            {count}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>

            {filteredMembers?.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="Nenhum membro encontrado"
                    description={search || officeFilter !== 'all' ? "Tente ajustar os filtros" : "Não há membros cadastrados ainda"}
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
                            {filteredMembers?.length || 0} {filteredMembers?.length === 1 ? 'membro encontrado' : 'membros encontrados'}
                        </Text>
                    }
                />
            )}
        </View>
    );
}
