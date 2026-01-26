import { View, Text, Pressable, Modal, FlatList, StatusBar, Platform } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Check } from 'lucide-react-native';
import { bibleService, BibleVersion } from '@/services/bible';
import { colors } from '@/constants/colors';

interface VersionSelectorProps {
    value: string;
    onChange: (version: string) => void;
}

export function VersionSelector({ value, onChange }: VersionSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const insets = useSafeAreaInsets();

    const { data: versions } = useQuery({
        queryKey: ['bible', 'versions'],
        queryFn: () => bibleService.getVersions(),
    });

    const selectedVersion = versions?.find((v) => v.id === value);
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

    return (
        <>
            <Pressable
                onPress={() => setIsOpen(true)}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: '#ffffff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f1f5f9',
                }}
            >
                <View>
                    <Text style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>
                        Versão
                    </Text>
                    <Text style={{ fontWeight: '500', color: '#1e293b' }}>
                        {selectedVersion?.name || value.toUpperCase()}
                    </Text>
                </View>
                <ChevronDown size={20} color="#94a3b8" />
            </Pressable>

            <Modal
                visible={isOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={{ 
                    flex: 1, 
                    backgroundColor: '#ffffff',
                    paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : insets.top + 8,
                }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        paddingBottom: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f1f5f9',
                    }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
                            Selecionar Versão
                        </Text>
                        <Pressable 
                            onPress={() => setIsOpen(false)}
                            style={{ paddingVertical: 6, paddingHorizontal: 12 }}
                        >
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#10b981' }}>
                                Fechar
                            </Text>
                        </Pressable>
                    </View>

                    {/* Lista de versões */}
                    <FlatList
                        data={versions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => {
                                    onChange(item.id);
                                    setIsOpen(false);
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 20,
                                    paddingVertical: 16,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#f8fafc',
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={{ 
                                        fontSize: 16, 
                                        fontWeight: value === item.id ? '600' : '400',
                                        color: '#1e293b',
                                    }}>
                                        {item.name}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>
                                        {item.description}
                                    </Text>
                                </View>
                                {value === item.id && (
                                    <Check size={22} color="#10b981" />
                                )}
                            </Pressable>
                        )}
                    />
                </View>
            </Modal>
        </>
    );
}
