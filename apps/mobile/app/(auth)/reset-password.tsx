import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { colors } from '@/constants/colors';
import { toast } from '@/lib/toast';

const schema = z.object({
    password: z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
        .regex(/\d/, 'Deve conter pelo menos um número')
        .regex(/[!@#$%^&*]/, 'Deve conter pelo menos um caractere especial'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { token } = useLocalSearchParams<{ token: string }>();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: ResetPasswordForm) => {
        if (!token) {
            toast.error('Token inválido');
            return;
        }

        try {
            setIsLoading(true);
            await api.post('/auth/reset-password', {
                token,
                new_password: data.password,
            });
            setIsSuccess(true);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erro ao redefinir senha');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-6">
                <View className="h-20 w-20 rounded-full bg-emerald-100 items-center justify-center mb-6">
                    <CheckCircle size={40} color={colors.primary[600]} />
                </View>
                <Text className="text-2xl font-bold text-slate-900 text-center">
                    Senha alterada!
                </Text>
                <Text className="text-slate-500 text-center mt-3">
                    Sua senha foi redefinida com sucesso.
                </Text>
                <Button
                    onPress={() => router.replace('/(auth)/login')}
                    className="mt-8 w-full"
                >
                    Fazer Login
                </Button>
            </View>
        );
    }

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
                    <Text className="text-3xl font-bold text-slate-900">
                        Nova senha
                    </Text>
                    <Text className="text-slate-500 mt-2">
                        Crie uma senha forte para sua conta
                    </Text>
                </View>

                <View className="flex-1 px-6 pt-8">
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <View>
                                <Input
                                    label="Nova senha"
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

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Confirmar senha"
                                placeholder="••••••••"
                                value={value}
                                onChangeText={onChange}
                                error={errors.confirmPassword?.message}
                                secureTextEntry={!showPassword}
                                icon={<Lock size={20} color={colors.slate[400]} />}
                            />
                        )}
                    />

                    {/* Requisitos de senha */}
                    <View className="bg-slate-50 rounded-xl p-4 mb-6">
                        <Text className="text-sm font-medium text-slate-700 mb-2">
                            A senha deve conter:
                        </Text>
                        <Text className="text-sm text-slate-500">• Mínimo 8 caracteres</Text>
                        <Text className="text-sm text-slate-500">• Uma letra maiúscula</Text>
                        <Text className="text-sm text-slate-500">• Uma letra minúscula</Text>
                        <Text className="text-sm text-slate-500">• Um número</Text>
                        <Text className="text-sm text-slate-500">• Um caractere especial (!@#$%^&*)</Text>
                    </View>

                    <Button
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        size="lg"
                    >
                        Redefinir senha
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
