import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { colors } from '@/constants/colors';

type ForgotPasswordForm = ForgotPasswordFormData;

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordForm) => {
        try {
            setIsLoading(true);
            await api.post('/auth/forgot-password', { email: data.email });
            setIsSuccess(true);
        } catch (error) {
            // Não mostrar erro específico para evitar enumeração de emails
            setIsSuccess(true);
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
                    Email enviado!
                </Text>
                <Text className="text-slate-500 text-center mt-3 leading-6">
                    Se o email existir em nossa base, você receberá instruções para redefinir sua senha.
                </Text>
                <Button
                    onPress={() => router.replace('/(auth)/login')}
                    className="mt-8 w-full"
                >
                    Voltar para Login
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
            >
                <LinearGradient
                    colors={colors.gradients.primary}
                    className="pt-16 pb-12 px-6"
                    style={{ paddingTop: insets.top + 32 }}
                >
                    <Pressable
                        onPress={() => router.back()}
                        className="flex-row items-center self-start mb-6 -ml-1"
                    >
                        <ArrowLeft size={20} color="white" />
                        <Text className="text-white ml-1">Voltar</Text>
                    </Pressable>

                    <Text className="text-white text-3xl font-bold">Esqueceu sua senha?</Text>
                    <Text className="text-emerald-100 mt-2">
                        Informe seu email para recuperar o acesso
                    </Text>
                </LinearGradient>

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

                    <Button
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        size="lg"
                        className="mt-4"
                    >
                        Enviar instruções
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
