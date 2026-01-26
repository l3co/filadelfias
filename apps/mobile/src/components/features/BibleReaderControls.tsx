import { View, Text, Pressable, Modal, ScrollView, StatusBar, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { bibleService } from '@/services/bible';

interface BibleReaderControlsProps {
    visible: boolean;
    onClose: () => void;
    version: string;
    fontSize: number;
    isDarkMode: boolean;
    isSpeaking: boolean;
    onVersionChange: (version: string) => void;
    onFontIncrease: () => void;
    onFontDecrease: () => void;
    onToggleDarkMode: () => void;
    onToggleTTS: () => void;
}

const VERSION_INFO: Record<string, { name: string; description: string }> = {
    nvi: { name: 'Nova Versão Internacional', description: 'Linguagem moderna e acessível' },
    acf: { name: 'Almeida Corrigida Fiel', description: 'Tradução clássica e fiel aos originais' },
    aa: { name: 'Almeida Atualizada', description: 'Equilíbrio entre tradição e clareza' },
    ara: { name: 'Almeida Revista e Atualizada', description: 'Texto Tradicional e Atual (On-line)' },
};

export function BibleReaderControls({
    visible,
    onClose,
    version,
    fontSize,
    isDarkMode,
    isSpeaking,
    onVersionChange,
    onFontIncrease,
    onFontDecrease,
    onToggleDarkMode,
    onToggleTTS,
}: BibleReaderControlsProps) {
    const insets = useSafeAreaInsets();
    
    const { data: versions } = useQuery({
        queryKey: ['bible', 'versions'],
        queryFn: () => bibleService.getVersions(),
    });

    const bgColor = isDarkMode ? '#1e293b' : '#ffffff';
    const textColor = isDarkMode ? '#ffffff' : '#0f172a';
    const subtextColor = isDarkMode ? '#94a3b8' : '#64748b';
    const borderColor = isDarkMode ? '#334155' : '#e2e8f0';

    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={{ 
                flex: 1, 
                backgroundColor: bgColor,
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
                    borderBottomColor: borderColor,
                }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: textColor }}>
                        Selecionar Versão
                    </Text>
                    <Pressable 
                        onPress={onClose} 
                        style={{ 
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                        }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#10b981' }}>
                            Fechar
                        </Text>
                    </Pressable>
                </View>

                {/* Lista de versões */}
                <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
                    {versions?.map((v) => {
                        const info = VERSION_INFO[v.id] || { name: v.name, description: v.description };
                        const isSelected = version === v.id;
                        return (
                            <Pressable
                                key={v.id}
                                onPress={() => onVersionChange(v.id)}
                                style={{
                                    paddingVertical: 16,
                                    borderBottomWidth: 1,
                                    borderBottomColor: borderColor,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={{ 
                                        fontSize: 16, 
                                        fontWeight: isSelected ? '600' : '400',
                                        color: textColor,
                                    }}>
                                        {info.name}
                                    </Text>
                                    <Text style={{ 
                                        fontSize: 14, 
                                        color: subtextColor,
                                        marginTop: 2,
                                    }}>
                                        {info.description}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <Check size={22} color="#10b981" />
                                )}
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>
        </Modal>
    );
}
