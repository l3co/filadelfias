import { View, Text, FlatList, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Download } from 'lucide-react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { bibleService, BibleBook } from '@/services/bible';
import { useBibleVersion } from '@/hooks/useBibleVersion';
import { VersionSelector } from '@/components/features/VersionSelector';

export default function MemberBibleScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { version, setVersion } = useBibleVersion();

    const { data: books, isLoading } = useQuery({
        queryKey: ['bible', 'books', version],
        queryFn: () => bibleService.getBooks(version),
    });

    if (isLoading) {
        return <LoadingScreen message="Carregando livros..." />;
    }

    const oldTestament = books?.filter((b) => b.testament === 'old') || [];
    const newTestament = books?.filter((b) => b.testament === 'new') || [];

    const renderBook = ({ item }: { item: BibleBook }) => (
        <Pressable
            onPress={() => router.push(`/(public)/bible/${item.abbrev}/1`)}
            style={{
                flex: 1,
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: 12,
                margin: 4,
                borderWidth: 1,
                borderColor: '#f1f5f9',
            }}
        >
            <Text style={{ fontWeight: '500', color: '#1e293b' }}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>{item.chapters_count} cap.</Text>
        </Pressable>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
            {/* Header */}
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingHorizontal: 16, 
                paddingTop: 16, 
                paddingBottom: 12,
            }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>
                    Bíblia Sagrada
                </Text>
                
                {/* Botão de Download Offline */}
                <Pressable 
                    onPress={() => router.push('/(public)/downloads')}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#ecfdf5',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                    }}
                >
                    <Download size={18} color="#10b981" />
                    <Text style={{ color: '#10b981', fontWeight: '600', fontSize: 13, marginLeft: 6 }}>
                        Offline
                    </Text>
                </Pressable>
            </View>

            {/* Seletor de Versão */}
            <VersionSelector
                value={version}
                onChange={setVersion}
            />

            <FlatList
                data={[
                    { title: 'Antigo Testamento', data: oldTestament },
                    { title: 'Novo Testamento', data: newTestament },
                ]}
                renderItem={({ item: section }) => (
                    <View style={{ paddingHorizontal: 12 }}>
                        <Text style={{ 
                            fontSize: 13, 
                            fontWeight: '600', 
                            color: '#64748b', 
                            textTransform: 'uppercase', 
                            letterSpacing: 0.5,
                            paddingVertical: 12,
                        }}>
                            {section.title}
                        </Text>
                        <FlatList
                            data={section.data}
                            renderItem={renderBook}
                            keyExtractor={(item) => item.abbrev}
                            numColumns={2}
                            scrollEnabled={false}
                        />
                    </View>
                )}
                keyExtractor={(item) => item.title}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </View>
    );
}
