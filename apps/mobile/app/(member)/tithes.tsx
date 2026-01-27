import { View, Text, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListCard } from '@/components/ui/ListCard';
import { CreateTitheModal } from '@/components/features/tithes';
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
            <ListCard>
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
            </ListCard>
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

            <CreateTitheModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                amount={amount}
                onAmountChange={setAmount}
                type={type}
                onTypeChange={setType}
                notes={notes}
                onNotesChange={setNotes}
                onSubmit={() => submitMutation.mutate()}
                isSubmitting={submitMutation.isPending}
            />
        </View>
    );
}
