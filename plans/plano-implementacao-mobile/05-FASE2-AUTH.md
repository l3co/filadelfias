# 🔐 Fase 2: Autenticação

## Objetivo
Implementar fluxo completo de autenticação: Login, Esqueci a senha, Redefinir senha.

---

## Telas a Implementar

### 1. Login

```tsx
// app/(auth)/login.tsx
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
```

---

### 2. Esqueci a Senha

```tsx
// app/(auth)/forgot-password.tsx
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
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
  email: z.string().email('Email inválido'),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
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
          <Button
            variant="ghost"
            onPress={() => router.back()}
            icon={<ArrowLeft size={20} color="white" />}
            className="self-start mb-6 -ml-4"
          >
            <Text className="text-white">Voltar</Text>
          </Button>
          
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
```

---

### 3. Redefinir Senha

```tsx
// app/(auth)/reset-password.tsx
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
```

---

### 4. Troca de Senha Obrigatória (Primeiro Acesso)

```tsx
// app/(auth)/change-password.tsx
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
              <Input
                label="Nova senha"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                error={errors.newPassword?.message}
                secureTextEntry={!showPassword}
                icon={<Lock size={20} color={colors.slate[400]} />}
              />
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
```

---

## Layout de Autenticação

```tsx
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
```

---

## Utilitário de Toast

```tsx
// src/lib/toast.ts
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const toast = {
  success: (message: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS === 'ios') {
      // Usar biblioteca de toast nativa se disponível
    }
    // Fallback para Alert
    Alert.alert('Sucesso', message);
  },
  
  error: (message: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert('Erro', message);
  },
  
  info: (message: string) => {
    Alert.alert('Aviso', message);
  },
};
```

> **Nota**: Para uma UX melhor, considere usar `react-native-toast-message` ou `burnt` para toasts nativos.

---

## Fluxo de Redirecionamento

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function RootLayout() {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === '(public)';
    const inMemberGroup = segments[0] === '(member)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!isAuthenticated && (inMemberGroup || inAdminGroup)) {
      // Não autenticado tentando acessar área protegida
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Autenticado na tela de login
      // Verificar se precisa trocar senha
      if (user?.must_change_password) {
        router.replace('/(auth)/change-password');
      } else {
        // Redirecionar baseado no role
        const role = user?.memberships?.[0]?.role;
        if (role === 'ADMIN' || role === 'OWNER') {
          router.replace('/(admin)');
        } else {
          router.replace('/(member)');
        }
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
```

---

## Próximos Passos

1. → [06-FASE3-MEMBRO.md](./06-FASE3-MEMBRO.md) - Portal do Membro
