import { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, BellOff, ChevronLeft, CheckCircle2, PlayCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/stores/authStore';
import { readingPlanNotifications } from '@/services/readingPlanNotifications';
import {
    useMarkReadingPlanDay,
    useReadingPlansProgress,
    useReadingPlans,
    useStartReadingPlan,
} from '@/hooks/useBible';

const REMINDER_PRESETS = [
    { label: '07:00', hour: 7, minute: 0 },
    { label: '12:00', hour: 12, minute: 0 },
    { label: '20:30', hour: 20, minute: 30 },
];

function PlanCard({
    plan,
    progress,
    onStart,
    onCompleteDay,
    isStarting,
    isCompleting,
}: {
    plan: {
        id: string;
        name: string;
        description?: string;
        duration_days: number;
        readings: Array<{ day: number; title?: string; references: string[] }>;
    };
    progress?: {
        current_day: number;
        completed_readings: number[];
        completed_at?: string | null;
    } | null;
    onStart: () => void;
    onCompleteDay: (day: number) => void;
    isStarting: boolean;
    isCompleting: boolean;
}) {
    const nextDay = progress?.current_day ?? 1;
    const todayReading = plan.readings.find((item) => item.day === nextDay) ?? plan.readings[0];
    const isStarted = Boolean(progress);
    const isFinished = Boolean(progress?.completed_at);
    const completionRatio = Math.min((progress?.completed_readings.length ?? 0) / Math.max(plan.duration_days, 1), 1);

    return (
        <View
            style={{
                backgroundColor: '#ffffff',
                borderRadius: 18,
                padding: 18,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                marginBottom: 12,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 12 }}>
                    {plan.name}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#10b981' }}>
                    {plan.duration_days} dias
                </Text>
            </View>

            {plan.description && (
                <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8, lineHeight: 20 }}>
                    {plan.description}
                </Text>
            )}

            <View
                style={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: '#e2e8f0',
                    marginTop: 16,
                    overflow: 'hidden',
                }}
            >
                <View
                    style={{
                        width: `${completionRatio * 100}%`,
                        height: '100%',
                        backgroundColor: '#10b981',
                    }}
                />
            </View>

            <Text style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                {progress?.completed_readings.length ?? 0} de {plan.duration_days} concluídos
            </Text>

            {todayReading && (
                <View
                    style={{
                        marginTop: 16,
                        backgroundColor: '#f8fafc',
                        borderRadius: 14,
                        padding: 14,
                    }}
                >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563eb', marginBottom: 6 }}>
                        {isFinished ? 'Plano concluído' : `Dia ${todayReading.day}`}
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>
                        {todayReading.title || 'Leitura do dia'}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#475569', marginTop: 6, lineHeight: 20 }}>
                        {todayReading.references.join(' • ')}
                    </Text>
                </View>
            )}

            {!isStarted ? (
                <Pressable
                    onPress={onStart}
                    disabled={isStarting}
                    style={{
                        marginTop: 16,
                        backgroundColor: '#10b981',
                        borderRadius: 14,
                        paddingVertical: 14,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        opacity: isStarting ? 0.7 : 1,
                    }}
                >
                    <PlayCircle size={18} color="#ffffff" />
                    <Text style={{ color: '#ffffff', fontWeight: '700', marginLeft: 8 }}>
                        Iniciar plano
                    </Text>
                </Pressable>
            ) : !isFinished && todayReading ? (
                <Pressable
                    onPress={() => onCompleteDay(todayReading.day)}
                    disabled={isCompleting}
                    style={{
                        marginTop: 16,
                        backgroundColor: '#ecfdf5',
                        borderRadius: 14,
                        paddingVertical: 14,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        opacity: isCompleting ? 0.7 : 1,
                    }}
                >
                    <CheckCircle2 size={18} color="#10b981" />
                    <Text style={{ color: '#10b981', fontWeight: '700', marginLeft: 8 }}>
                        Marcar dia {todayReading.day}
                    </Text>
                </Pressable>
            ) : (
                <View
                    style={{
                        marginTop: 16,
                        backgroundColor: '#eff6ff',
                        borderRadius: 14,
                        paddingVertical: 14,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                    }}
                >
                    <CheckCircle2 size={18} color="#2563eb" />
                    <Text style={{ color: '#2563eb', fontWeight: '700', marginLeft: 8 }}>
                        Plano concluído
                    </Text>
                </View>
            )}
        </View>
    );
}

export default function BibleReadingPlansScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();
    const { data: plans = [], isLoading } = useReadingPlans(tenant?.id);
    const startPlan = useStartReadingPlan();
    const markDay = useMarkReadingPlanDay();
    const progressQueries = useReadingPlansProgress(plans.map((plan) => plan.id));
    const [reminderPlanId, setReminderPlanId] = useState<string | null>(null);
    const [reminderTime, setReminderTime] = useState<{ hour: number; minute: number }>({ hour: 7, minute: 0 });

    const progressMap = useMemo(
        () =>
            new Map(
                plans.map((plan, index) => [
                    plan.id,
                    progressQueries[index]?.data ?? null,
                ])
            ),
        [plans, progressQueries]
    );

    useEffect(() => {
        readingPlanNotifications.getReminder().then((reminder) => {
            setReminderPlanId(reminder?.planId ?? null);
            if (reminder) {
                setReminderTime({ hour: reminder.hour, minute: reminder.minute });
            }
        });
    }, []);

    const selectedReminderLabel = useMemo(
        () =>
            `${String(reminderTime.hour).padStart(2, '0')}:${String(reminderTime.minute).padStart(2, '0')}`,
        [reminderTime.hour, reminderTime.minute]
    );

    const handleToggleReminder = async (planId: string, planName: string) => {
        try {
            if (reminderPlanId === planId) {
                await readingPlanNotifications.cancelReminder();
                setReminderPlanId(null);
                toast.success('Lembrete diário removido');
                return;
            }

            await readingPlanNotifications.scheduleDailyReminder(
                planId,
                planName,
                reminderTime.hour,
                reminderTime.minute,
            );
            setReminderPlanId(planId);
            toast.success(`Lembrete diário agendado para ${selectedReminderLabel}`);
        } catch (error) {
            toast.error('Não foi possível configurar o lembrete');
        }
    };

    if (!tenant?.id) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top, paddingHorizontal: 16 }}>
                <Pressable onPress={() => router.back()} style={{ paddingVertical: 16 }}>
                    <ChevronLeft size={24} color="#475569" />
                </Pressable>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>
                    Planos de Leitura
                </Text>
                <Text style={{ fontSize: 15, color: '#64748b', marginTop: 16, lineHeight: 22 }}>
                    Faça login em uma igreja para acompanhar planos de leitura e progresso diário.
                </Text>
            </View>
        );
    }

    if (isLoading) {
        return <LoadingScreen message="Carregando planos..." />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 12,
                }}
            >
                <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
                    <ChevronLeft size={24} color="#475569" />
                </Pressable>
                <View style={{ marginLeft: 8 }}>
                    <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>
                        Planos de Leitura
                    </Text>
                    <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        Acompanhe sua leitura diária na igreja
                    </Text>
                </View>
            </View>

            <Text style={{ fontSize: 13, color: '#64748b', paddingHorizontal: 16, paddingBottom: 12 }}>
                Você pode ativar um lembrete diário para o plano que estiver acompanhando.
            </Text>

            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 10 }}>
                    Horário do lembrete
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {REMINDER_PRESETS.map((preset) => {
                        const active = reminderTime.hour === preset.hour && reminderTime.minute === preset.minute;
                        return (
                            <Pressable
                                key={preset.label}
                                onPress={() => setReminderTime({ hour: preset.hour, minute: preset.minute })}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    borderRadius: 999,
                                    backgroundColor: active ? '#10b981' : '#ffffff',
                                    borderWidth: 1,
                                    borderColor: active ? '#10b981' : '#e2e8f0',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: '700',
                                        color: active ? '#ffffff' : '#475569',
                                    }}
                                >
                                    {preset.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <FlatList
                data={plans}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                ListEmptyComponent={
                    <View style={{ paddingTop: 24 }}>
                        <Text style={{ fontSize: 15, color: '#64748b', lineHeight: 22 }}>
                            Ainda não há planos públicos cadastrados para este tenant.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View>
                        <PlanCard
                            plan={item}
                            progress={progressMap.get(item.id)}
                            onStart={() => startPlan.mutate(item.id)}
                            onCompleteDay={(day) => markDay.mutate({ planId: item.id, day })}
                            isStarting={startPlan.isPending}
                            isCompleting={markDay.isPending}
                        />

                        <Pressable
                            onPress={() => handleToggleReminder(item.id, item.name)}
                            style={{
                                marginTop: -2,
                                marginBottom: 14,
                                marginHorizontal: 6,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: reminderPlanId === item.id ? '#fff7ed' : '#eff6ff',
                                borderRadius: 14,
                                paddingVertical: 12,
                            }}
                        >
                            {reminderPlanId === item.id ? (
                                <BellOff size={18} color="#ea580c" />
                            ) : (
                                <Bell size={18} color="#2563eb" />
                            )}
                            <Text
                                style={{
                                    marginLeft: 8,
                                    fontWeight: '700',
                                    color: reminderPlanId === item.id ? '#ea580c' : '#2563eb',
                                }}
                            >
                                {reminderPlanId === item.id
                                    ? `Desativar lembrete (${selectedReminderLabel})`
                                    : `Ativar lembrete (${selectedReminderLabel})`}
                            </Text>
                        </Pressable>
                    </View>
                )}
            />
        </View>
    );
}
