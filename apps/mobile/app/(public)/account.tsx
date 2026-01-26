import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
    LogIn, UserPlus, ChevronRight, Church, Heart, 
    User, Settings, LogOut, Bell, BookOpen, Calendar 
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';

export default function AccountScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, isAuthenticated, logout, getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    // Se estiver autenticado, mostra o perfil
    if (isAuthenticated && user) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header do Perfil */}
                    <View style={{ 
                        backgroundColor: '#10b981', 
                        paddingHorizontal: 20, 
                        paddingTop: 24, 
                        paddingBottom: 32,
                        borderBottomLeftRadius: 24,
                        borderBottomRightRadius: 24,
                    }}>
                        <Text style={{ fontSize: 28, fontWeight: '700', color: '#ffffff', letterSpacing: -0.5 }}>
                            Minha Conta
                        </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                            <Avatar name={user.name} size="lg" />
                            <View style={{ marginLeft: 16, flex: 1 }}>
                                <Text style={{ fontSize: 20, fontWeight: '600', color: '#ffffff' }}>
                                    {user.name}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                                    {user.email}
                                </Text>
                                {tenant && (
                                    <View style={{ 
                                        backgroundColor: 'rgba(255,255,255,0.2)', 
                                        paddingHorizontal: 10, 
                                        paddingVertical: 4, 
                                        borderRadius: 8,
                                        marginTop: 8,
                                        alignSelf: 'flex-start',
                                    }}>
                                        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '500' }}>
                                            {tenant.name}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                        {/* Acesso Rápido */}
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>
                            Acesso Rápido
                        </Text>
                        
                        <Pressable
                            onPress={() => router.push('/(member)')}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.04,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <View style={{ backgroundColor: '#ecfdf5', padding: 10, borderRadius: 10 }}>
                                <Church size={20} color="#10b981" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500', color: '#0f172a' }}>
                                    Portal do Membro
                                </Text>
                                <Text style={{ fontSize: 13, color: '#64748b' }}>
                                    Acesse todas as funcionalidades
                                </Text>
                            </View>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </Pressable>

                        <Pressable
                            onPress={() => router.push('/(member)/devotionals')}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.04,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <View style={{ backgroundColor: '#fef2f2', padding: 10, borderRadius: 10 }}>
                                <Heart size={20} color="#ef4444" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500', color: '#0f172a' }}>
                                    Devocionais
                                </Text>
                                <Text style={{ fontSize: 13, color: '#64748b' }}>
                                    Reflexões diárias
                                </Text>
                            </View>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </Pressable>

                        <Pressable
                            onPress={() => router.push('/(member)/events')}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.04,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <View style={{ backgroundColor: '#fff7ed', padding: 10, borderRadius: 10 }}>
                                <Calendar size={20} color="#f97316" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500', color: '#0f172a' }}>
                                    Eventos
                                </Text>
                                <Text style={{ fontSize: 13, color: '#64748b' }}>
                                    Próximas atividades
                                </Text>
                            </View>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </Pressable>

                        {/* Configurações */}
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 12, marginTop: 16, textTransform: 'uppercase' }}>
                            Configurações
                        </Text>

                        <Pressable
                            onPress={() => router.push('/(member)/profile')}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.04,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <View style={{ backgroundColor: '#f1f5f9', padding: 10, borderRadius: 10 }}>
                                <User size={20} color="#64748b" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500', color: '#0f172a' }}>
                                    Editar Perfil
                                </Text>
                            </View>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </Pressable>

                        <Pressable
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.04,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <View style={{ backgroundColor: '#f1f5f9', padding: 10, borderRadius: 10 }}>
                                <Bell size={20} color="#64748b" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 16, fontWeight: '500', color: '#0f172a' }}>
                                    Notificações
                                </Text>
                            </View>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </Pressable>

                        {/* Sair */}
                        <Pressable
                            onPress={handleLogout}
                            style={{
                                backgroundColor: '#fef2f2',
                                borderRadius: 16,
                                padding: 16,
                                marginTop: 16,
                                marginBottom: 32,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <LogOut size={20} color="#ef4444" />
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef4444', marginLeft: 8 }}>
                                Sair da Conta
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // Se não estiver autenticado, mostra opções de login
    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 }}>
                    Conta
                </Text>
                <Text style={{ color: '#64748b', marginTop: 4 }}>
                    Acesse sua conta para mais recursos
                </Text>
            </View>

            <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                {/* Login Card */}
                <Pressable
                    onPress={() => router.push('/(auth)/login')}
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        elevation: 2,
                    }}
                >
                    <View style={{ 
                        backgroundColor: '#ecfdf5', 
                        padding: 12, 
                        borderRadius: 12 
                    }}>
                        <LogIn size={24} color="#10b981" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={{ fontSize: 17, fontWeight: '600', color: '#0f172a' }}>
                            Entrar
                        </Text>
                        <Text style={{ color: '#64748b', marginTop: 2 }}>
                            Já tenho uma conta
                        </Text>
                    </View>
                    <ChevronRight size={22} color="#cbd5e1" />
                </Pressable>

                {/* Register Card */}
                <Pressable
                    onPress={() => router.push('/(auth)/register')}
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 16,
                        padding: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        elevation: 2,
                    }}
                >
                    <View style={{ 
                        backgroundColor: '#eff6ff', 
                        padding: 12, 
                        borderRadius: 12 
                    }}>
                        <UserPlus size={24} color="#3b82f6" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={{ fontSize: 17, fontWeight: '600', color: '#0f172a' }}>
                            Criar conta
                        </Text>
                        <Text style={{ color: '#64748b', marginTop: 2 }}>
                            Sou novo por aqui
                        </Text>
                    </View>
                    <ChevronRight size={22} color="#cbd5e1" />
                </Pressable>

                {/* Info Card */}
                <View style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: 16,
                    padding: 20,
                    marginTop: 24,
                    borderWidth: 1,
                    borderColor: '#bbf7d0',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Church size={20} color="#10b981" />
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#166534', marginLeft: 8 }}>
                            Benefícios da conta
                        </Text>
                    </View>
                    <Text style={{ color: '#15803d', lineHeight: 22 }}>
                        • Acesse devocionais diários{'\n'}
                        • Veja eventos da sua igreja{'\n'}
                        • Sincronize suas leituras{'\n'}
                        • Participe de votações
                    </Text>
                </View>

                {/* Footer */}
                <View style={{ alignItems: 'center', marginTop: 32 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Heart size={14} color="#94a3b8" />
                        <Text style={{ color: '#94a3b8', fontSize: 13, marginLeft: 6 }}>
                            Igreja Presbiteriana Filadélfia
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
