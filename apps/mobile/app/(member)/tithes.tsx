import { View, Text, FlatList, Pressable, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, Clock, CheckCircle, XCircle, X, DollarSign } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { titheService, TitheRecord } from '@/services/tithe';
import { formatDate } from '@/lib/utils';
import { colors } from '@/constants/colors';
import { toast } from '@/lib/toast';

const STATUS_CONFIG = {
    PENDING: { icon: Clock, color: '#f59e0b', label: 'Pendente', bg: 'bg-amber-50' },
    APPROVED: { icon: CheckCircle, color: '#10b981', label: 'Aprovado', bg: 'bg-green-50' },
    REJECTED: { icon: XCircle, color: '#ef4444', label: 'Rejeitado', bg: 'bg-red-50' },
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export default function TithesScreen() {
    const queryClient = useQueryClient();
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'DIZIMO' | 'OFERTA'>('DIZIMO');
    const [notes, setNotes] = useState('');

    const { data: records, isLoading } = useQuery({
        queryKey: ['my-tithes', tenant?.id],
        queryFn: () => titheService.getMyRecords(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    const { data: summary } = useQuery({
        queryKey: ['my-tithes', 'summary', tenant?.id],
        queryFn: () => titheService.getSummary(tenant?.id || ''),
        enabled: !!tenant?.id,
    });

    const submitMutation = useMutation({
        mutationFn: () => titheService.submit(tenant?.id || '', {
            amount: parseFloat(amount.replace(',', '.')),
            type,
            notes: notes || undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-tithes', tenant?.id] });
            setIsModalOpen(false);
            setAmount('');
            setNotes('');
            toast.success('Registro enviado!');
        },
        onError: () => toast.error('Erro ao enviar registro'),
    });

    if (isLoading) {
        return <LoadingScreen message="Carregando registros..." />;
    }

    const renderRecord = ({ item }: { item: TitheRecord }) => {
        const status = STATUS_CONFIG[item.status];
        const StatusIcon = status.icon;

        return (
            <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className={`h-10 w-10 rounded-xl ${status.bg} items-center justify-center`}>
                            <StatusIcon size={20} color={status.color} />
                        </View>
                        <View className="ml-3">
                            <Text className="font-semibold text-slate-900">
                                {item.type === 'DIZIMO' ? 'Dízimo' : 'Oferta'}
                            </Text>
                            <Text className="text-xs text-slate-400">{formatDate(item.date)}</Text>
                        </View>
                    </View>

                    <View className="items-end">
                        <Text className="font-bold text-slate-900 text-lg">
                            {formatCurrency(item.amount)}
                        </Text>
                        <Text className="text-xs" style={{ color: status.color }}>
                            {status.label}
                        </Text>
                    </View>
                </View>

                {item.notes && (
                    <Text className="text-sm text-slate-500 mt-2">{item.notes}</Text>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Header
                title="Meus Dízimos"
                showBack
                rightAction={
                    <Pressable
                        onPress={() => setIsModalOpen(true)}
                        className="h-9 w-9 rounded-xl bg-emerald-100 items-center justify-center"
                    >
                        <Plus size={20} color={colors.primary[600]} />
                    </Pressable>
                }
            />

            <FlatList
                data={records}
                renderItem={renderRecord}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    summary ? (
                        <View className="flex-row gap-3 mb-4">
                            <View className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <Text className="text-xs text-emerald-600 uppercase font-medium">Este Mês</Text>
                                <Text className="text-xl font-bold text-emerald-800 mt-1">
                                    {formatCurrency(summary.total_month)}
                                </Text>
                            </View>
                            <View className="flex-1 bg-slate-100 rounded-xl p-4">
                                <Text className="text-xs text-slate-500 uppercase font-medium">Este Ano</Text>
                                <Text className="text-xl font-bold text-slate-800 mt-1">
                                    {formatCurrency(summary.total_year)}
                                </Text>
                            </View>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <EmptyState
                        icon={Wallet}
                        title="Nenhum registro"
                        description="Seus dízimos e ofertas aparecerão aqui."
                        action={
                            <Button onPress={() => setIsModalOpen(true)}>
                                Novo Registro
                            </Button>
                        }
                    />
                }
            />

            {/* Modal de Novo Registro */}
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
                        <Text className="text-lg font-bold text-slate-900">Novo Registro</Text>
                        <View className="w-6" />
                    </View>

                    <View className="p-4 flex-1">
                        {/* Tipo */}
                        <Text className="text-sm font-medium text-slate-700 mb-2">Tipo</Text>
                        <View className="flex-row gap-3 mb-6">
                            <Pressable
                                onPress={() => setType('DIZIMO')}
                                className={`flex-1 py-3 rounded-xl items-center border-2 ${type === 'DIZIMO' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                                    }`}
                            >
                                <Text className={type === 'DIZIMO' ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
                                    Dízimo
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setType('OFERTA')}
                                className={`flex-1 py-3 rounded-xl items-center border-2 ${type === 'OFERTA' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                                    }`}
                            >
                                <Text className={type === 'OFERTA' ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
                                    Oferta
                                </Text>
                            </Pressable>
                        </View>

                        {/* Valor */}
                        <Text className="text-sm font-medium text-slate-700 mb-2">Valor</Text>
                        <View className="flex-row items-center bg-slate-50 rounded-xl px-4 mb-6">
                            <DollarSign size={20} color={colors.slate[400]} />
                            <TextInput
                                placeholder="0,00"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                className="flex-1 py-3.5 text-lg text-slate-900 ml-2"
                                placeholderTextColor={colors.slate[400]}
                            />
                        </View>

                        {/* Observações */}
                        <Text className="text-sm font-medium text-slate-700 mb-2">Observações (opcional)</Text>
                        <TextInput
                            placeholder="Ex: Oferta missionária..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            className="bg-slate-50 rounded-xl px-4 py-3 text-base text-slate-900"
                            placeholderTextColor={colors.slate[400]}
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="p-4 border-t border-slate-100">
                        <Button
                            onPress={() => submitMutation.mutate()}
                            loading={submitMutation.isPending}
                            disabled={!amount}
                            size="lg"
                        >
                            Enviar Registro
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
