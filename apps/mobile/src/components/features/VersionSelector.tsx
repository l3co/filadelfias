import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Check } from 'lucide-react-native';
import { bibleService, BibleVersion } from '@/services/bible';
import { colors } from '@/constants/colors';

interface VersionSelectorProps {
    value: string;
    onChange: (version: string) => void;
}

export function VersionSelector({ value, onChange }: VersionSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { data: versions } = useQuery({
        queryKey: ['bible', 'versions'],
        queryFn: bibleService.getVersions,
    });

    const selectedVersion = versions?.find((v) => v.id === value);

    return (
        <>
            <Pressable
                onPress={() => setIsOpen(true)}
                className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100"
            >
                <View>
                    <Text className="text-xs text-slate-400 uppercase">Versão</Text>
                    <Text className="font-medium text-slate-800">
                        {selectedVersion?.name || value.toUpperCase()}
                    </Text>
                </View>
                <ChevronDown size={20} color={colors.slate[400]} />
            </Pressable>

            <Modal
                visible={isOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsOpen(false)}
            >
                <View className="flex-1 bg-white pt-4">
                    <View className="flex-row items-center justify-between px-4 pb-4 border-b border-slate-100">
                        <Text className="text-lg font-bold text-slate-900">Selecionar Versão</Text>
                        <Pressable onPress={() => setIsOpen(false)}>
                            <Text className="text-emerald-600 font-medium">Fechar</Text>
                        </Pressable>
                    </View>

                    <FlatList
                        data={versions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => {
                                    onChange(item.id);
                                    setIsOpen(false);
                                }}
                                className="flex-row items-center px-4 py-4 border-b border-slate-50"
                            >
                                <View className="flex-1">
                                    <Text className="font-medium text-slate-800">{item.name}</Text>
                                    <Text className="text-sm text-slate-500">{item.description}</Text>
                                </View>
                                {value === item.id && (
                                    <Check size={20} color={colors.primary[600]} />
                                )}
                            </Pressable>
                        )}
                    />
                </View>
            </Modal>
        </>
    );
}
