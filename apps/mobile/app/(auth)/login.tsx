import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { toast } from '@/lib/toast';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAdmin } = useAuthStore();

    const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            setIsLoading(true);
            await login(data.email, data.password);

            // Redirecionar baseado no role
            if (isAdmin()) {
                router.replace('/(admin)');
            } else {
                router.replace('/(member)');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header com Gradiente */}
                <LinearGradient
                    colors={colors.gradients.primary}
                    className="pt-16 pb-12 px-6"
                    style={{ paddingTop: insets.top + 32 }}
                >
                    <Pressable
                        onPress={() => router.back()}
                        className="mb-6"
                    >
                        <Text className="text-emerald-100">← Voltar</Text>
                    </Pressable>

                    <Text className="text-white text-3xl font-bold">Bem-vindo de volta</Text>
                    <Text className="text-emerald-100 mt-2">
                        Entre na sua conta para continuar
                    </Text>
                </LinearGradient>

                {/* Formulário */}
                <View className="flex-1 px-6 pt-8 -mt-4 bg-white rounded-t-3xl">
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Email"
                                placeholder="seu@email.com"
                                value={value}
                                onChangeText={onChange}
                                error={errors.email?.message}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon={<Mail size={20} color={colors.slate[400]} />}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <View>
                                <Input
                                    label="Senha"
                                    placeholder="••••••••"
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.password?.message}
                                    secureTextEntry={!showPassword}
                                    icon={<Lock size={20} color={colors.slate[400]} />}
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-10"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} color={colors.slate[400]} />
                                    ) : (
                                        <Eye size={20} color={colors.slate[400]} />
                                    )}
                                </Pressable>
                            </View>
                        )}
                    />

                    <Pressable
                        onPress={() => router.push('/(auth)/forgot-password')}
                        className="self-end mb-6"
                    >
                        <Text className="text-emerald-600 font-medium">Esqueceu a senha?</Text>
                    </Pressable>

                    <Button
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        size="lg"
                    >
                        Entrar
                    </Button>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-slate-500">Não tem uma conta? </Text>
                        <Pressable onPress={() => router.push('/(public)')}>
                            <Text className="text-emerald-600 font-medium">
                                Fale com sua igreja
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
