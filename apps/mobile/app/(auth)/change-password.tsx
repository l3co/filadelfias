import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { toast } from '@/lib/toast';

const schema = z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
        .regex(/\d/, 'Deve conter pelo menos um número')
        .regex(/[!@#$%^&*]/, 'Deve conter pelo menos um caractere especial'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
});

type ChangePasswordForm = z.infer<typeof schema>;

export default function ChangePasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { checkAuth, isAdmin } = useAuthStore();

    const { control, handleSubmit, formState: { errors } } = useForm<ChangePasswordForm>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: ChangePasswordForm) => {
        try {
            setIsLoading(true);
            await api.post('/auth/change-password', {
                current_password: data.currentPassword,
                new_password: data.newPassword,
            });

            toast.success('Senha alterada com sucesso!');
            await checkAuth(); // Atualiza dados do usuário

            // Redirecionar
            if (isAdmin()) {
                router.replace('/(admin)');
            } else {
                router.replace('/(member)');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erro ao alterar senha');
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
                style={{ paddingTop: insets.top }}
            >
                <View className="px-6 pt-8">
                    {/* Alerta */}
                    <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex-row items-start mb-6">
                        <AlertTriangle size={24} color={colors.warning} />
                        <View className="ml-3 flex-1">
                            <Text className="font-semibold text-amber-800">
                                Primeiro acesso
                            </Text>
                            <Text className="text-amber-700 text-sm mt-1">
                                Por segurança, você precisa trocar sua senha temporária.
                            </Text>
                        </View>
                    </View>

                    <Text className="text-3xl font-bold text-slate-900">
                        Criar nova senha
                    </Text>
                    <Text className="text-slate-500 mt-2">
                        Escolha uma senha segura para sua conta
                    </Text>
                </View>

                <View className="flex-1 px-6 pt-8">
                    <Controller
                        control={control}
                        name="currentPassword"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Senha temporária"
                                placeholder="Senha recebida por email"
                                value={value}
                                onChangeText={onChange}
                                error={errors.currentPassword?.message}
                                secureTextEntry={!showPassword}
                                icon={<Lock size={20} color={colors.slate[400]} />}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="newPassword"
                        render={({ field: { onChange, value } }) => (
                            <View>
                                <Input
                                    label="Nova senha"
                                    placeholder="••••••••"
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.newPassword?.message}
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

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Confirmar nova senha"
                                placeholder="••••••••"
                                value={value}
                                onChangeText={onChange}
                                error={errors.confirmPassword?.message}
                                secureTextEntry={!showPassword}
                                icon={<Lock size={20} color={colors.slate[400]} />}
                            />
                        )}
                    />

                    <Button
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        size="lg"
                        className="mt-4"
                    >
                        Salvar nova senha
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
