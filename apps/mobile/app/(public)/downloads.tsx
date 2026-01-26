import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useEffect } from 'react';
import { Download, BookOpen, Music, BookMarked, Trash2, Check, Cloud } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useDownloadStore } from '@/stores/downloadStore';
import { formatDate } from '@/lib/utils';
import { colors } from '@/constants/colors';
import { toast } from '@/lib/toast';

const DOWNLOAD_OPTIONS = [
    {
        id: 'bible-nvi',
        type: 'bible' as const,
        typeId: 'nvi',
        icon: BookOpen,
        title: 'Bíblia NVI',
        description: 'Nova Versão Internacional',
        color: '#3b82f6',
    },
    {
        id: 'bible-ara',
        type: 'bible' as const,
        typeId: 'ara',
        icon: BookOpen,
        title: 'Bíblia ARA',
        description: 'Almeida Revista e Atualizada',
        color: '#3b82f6',
    },
    {
        id: 'hymnal',
        type: 'hymnal' as const,
        icon: Music,
        title: 'Hinário Novo Cântico',
        description: 'Todos os hinos disponíveis',
        color: '#8b5cf6',
    },
    {
        id: 'manual',
        type: 'manual' as const,
        icon: BookMarked,
        title: 'Manual IPB',
        description: 'Edição 2019 completa',
        color: '#059669',
    },
];

export default function DownloadsScreen() {
    const insets = useSafeAreaInsets();
    const {
        isDownloading,
        progress,
        downloads,
        startDownload,
        refreshDownloads,
        deleteDownload
    } = useDownloadStore();

    useEffect(() => {
        refreshDownloads();
    }, []);

    const handleDownload = async (option: typeof DOWNLOAD_OPTIONS[0]) => {
        try {
            await startDownload(option.type, option.typeId);
            toast.success(`${option.title} baixado com sucesso!`);
        } catch (error) {
            toast.error(`Erro ao baixar ${option.title}`);
        }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Remover download',
            `Tem certeza que deseja remover "${name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteDownload(id);
                        toast.info('Download removido');
                    },
                },
            ]
        );
    };

    const isOptionDownloaded = (optionId: string) => {
        return downloads.some(d => d.id === optionId);
    };

    const getDownloadInfo = (optionId: string) => {
        return downloads.find(d => d.id === optionId);
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Header title="Downloads" showBack />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
            >
                {/* Progresso do Download */}
                {isDownloading && progress && (
                    <View className="bg-emerald-50 rounded-2xl p-4 mb-4 border border-emerald-200">
                        <View className="flex-row items-center mb-3">
                            <ActivityIndicator color={colors.primary[600]} />
                            <Text className="text-emerald-700 font-medium ml-2">
                                Baixando...
                            </Text>
                        </View>
                        <Text className="text-emerald-600 text-sm mb-2">{progress.name}</Text>
                        <View className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </View>
                        <Text className="text-xs text-emerald-500 mt-1 text-right">
                            {progress.current} de {progress.total}
                        </Text>
                    </View>
                )}

                {/* Opções de Download */}
                <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Conteúdo Disponível
                </Text>

                {DOWNLOAD_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const downloaded = isOptionDownloaded(option.id);
                    const info = getDownloadInfo(option.id);

                    return (
                        <View
                            key={option.id}
                            className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
                        >
                            <View className="flex-row items-start">
                                <View
                                    className="h-12 w-12 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: `${option.color}15` }}
                                >
                                    <Icon size={24} color={option.color} />
                                </View>

                                <View className="ml-3 flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="font-semibold text-slate-900">{option.title}</Text>
                                        {downloaded && (
                                            <View className="ml-2 h-5 w-5 rounded-full bg-emerald-500 items-center justify-center">
                                                <Check size={12} color="white" />
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-sm text-slate-500">{option.description}</Text>

                                    {downloaded && info && (
                                        <Text className="text-xs text-slate-400 mt-1">
                                            Baixado em {formatDate(info.downloaded_at)} • {info.size} itens
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View className="flex-row gap-2 mt-3">
                                {downloaded ? (
                                    <>
                                        <Pressable
                                            onPress={() => handleDownload(option)}
                                            disabled={isDownloading}
                                            className="flex-1 flex-row items-center justify-center py-2.5 bg-slate-100 rounded-xl"
                                        >
                                            <Cloud size={18} color={colors.slate[600]} />
                                            <Text className="text-slate-600 font-medium ml-2">Atualizar</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleDelete(option.id, option.title)}
                                            className="px-4 py-2.5 bg-red-50 rounded-xl"
                                        >
                                            <Trash2 size={18} color={colors.error} />
                                        </Pressable>
                                    </>
                                ) : (
                                    <Pressable
                                        onPress={() => handleDownload(option)}
                                        disabled={isDownloading}
                                        className="flex-1 flex-row items-center justify-center py-2.5 bg-emerald-50 rounded-xl"
                                    >
                                        <Download size={18} color={colors.primary[600]} />
                                        <Text className="text-emerald-600 font-medium ml-2">Baixar</Text>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    );
                })}

                {/* Info */}
                <View className="bg-slate-100 rounded-xl p-4 mt-4">
                    <Text className="text-sm text-slate-600 leading-5">
                        📱 Os conteúdos baixados ficam disponíveis mesmo sem conexão com a internet.
                        Atualize periodicamente para ter a versão mais recente.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
