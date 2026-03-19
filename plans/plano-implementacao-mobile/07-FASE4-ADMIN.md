# 🛡️ Fase 4: Área Administrativa

## Objetivo
Implementar a área administrativa para usuários com permissões de admin/owner.

---

## Layout Administrativo

```tsx
// app/(admin)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Users, DollarSign, Settings, MoreHorizontal } from 'lucide-react-native';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { colors } from '@/constants/colors';

export default function AdminLayout() {
  return (
    <ProtectedRoute requireAdmin>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary[600],
          tabBarInactiveTintColor: colors.slate[400],
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: colors.slate[100],
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="members"
          options={{
            title: 'Membros',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="financial"
          options={{
            title: 'Finanças',
            tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'Mais',
            tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Config',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
```

---

## Telas Administrativas

### 1. Dashboard Admin

```tsx
// app/(admin)/index.tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Users, DollarSign, GraduationCap, Globe, 
  Calendar, Heart, Award, TrendingUp 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { StatCard } from '@/components/ui/StatCard';
import { Avatar } from '@/components/ui/Avatar';
import { colors } from '@/constants/colors';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();

  // Aqui você pode adicionar queries para buscar estatísticas
  // const { data: stats } = useQuery({ ... });

  const stats = [
    { icon: Users, label: 'Membros', value: '127', color: colors.primary[600] },
    { icon: DollarSign, label: 'Saldo', value: 'R$ 15.420', color: colors.info },
    { icon: GraduationCap, label: 'Turmas EBD', value: '8', color: colors.warning },
    { icon: Globe, label: 'Missionários', value: '5', color: colors.purple[600] },
  ];

  const quickActions = [
    { icon: Users, label: 'Novo Membro', href: '/(admin)/members/new', color: 'emerald' },
    { icon: Calendar, label: 'Novo Evento', href: '/(admin)/events/new', color: 'orange' },
    { icon: Heart, label: 'Devocional', href: '/(admin)/devotionals/new', color: 'red' },
    { icon: DollarSign, label: 'Lançamento', href: '/(admin)/financial/new', color: 'blue' },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.premium}
        className="px-4 pb-6 rounded-b-3xl"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/80 text-sm">Área Administrativa</Text>
            <Text className="text-white text-xl font-bold">{tenant?.name}</Text>
          </View>
          <Pressable onPress={() => router.push('/(admin)/settings')}>
            <Avatar name={user?.name} size="md" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1 px-4 -mt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <View key={stat.label} className="w-[48%] mb-3">
                <View className="bg-white rounded-2xl p-4 border border-slate-100">
                  <View className="flex-row items-center justify-between">
                    <Icon size={24} color={stat.color} />
                    <TrendingUp size={16} color={colors.success} />
                  </View>
                  <Text className="text-2xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </Text>
                  <Text className="text-sm text-slate-500">{stat.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Ações Rápidas */}
        <Text className="font-semibold text-slate-700 mt-4 mb-3">Ações Rápidas</Text>
        <View className="flex-row flex-wrap justify-between">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Pressable
                key={action.label}
                onPress={() => router.push(action.href)}
                className="w-[48%] bg-white rounded-2xl p-4 mb-3 border border-slate-100 active:scale-[0.98]"
              >
                <View className={`h-10 w-10 rounded-xl bg-${action.color}-50 items-center justify-center mb-2`}>
                  <Icon size={20} color={colors[action.color]?.[600] || colors.primary[600]} />
                </View>
                <Text className="font-medium text-slate-700">{action.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Atividade Recente */}
        <Text className="font-semibold text-slate-700 mt-4 mb-3">Atividade Recente</Text>
        <View className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
          {/* Placeholder para atividades */}
          <View className="p-4 flex-row items-center">
            <View className="h-8 w-8 rounded-full bg-emerald-100 items-center justify-center">
              <Users size={16} color={colors.primary[600]} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-800">Novo membro cadastrado</Text>
              <Text className="text-xs text-slate-400">Maria Silva • há 2 horas</Text>
            </View>
          </View>
          <View className="p-4 flex-row items-center">
            <View className="h-8 w-8 rounded-full bg-blue-100 items-center justify-center">
              <DollarSign size={16} color={colors.info} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-800">Dízimo registrado</Text>
              <Text className="text-xs text-slate-400">R$ 500,00 • há 5 horas</Text>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
```

---

### 2. Gestão de Membros

```tsx
// app/(admin)/members/index.tsx
import { View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Search, Plus, User, MoreVertical, Send } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { membersService, Member } from '@/services/members';
import { colors } from '@/constants/colors';

export default function MembersAdminScreen() {
  const router = useRouter();
  const { getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();
  const [search, setSearch] = useState('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', tenant?.id],
    queryFn: () => membersService.getAll(tenant?.id || ''),
    enabled: !!tenant?.id,
  });

  const filteredMembers = members?.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <LoadingScreen message="Carregando membros..." />;
  }

  const renderMember = ({ item }: { item: Member }) => (
    <Pressable
      onPress={() => router.push(`/(admin)/members/${item.id}`)}
      className="bg-white p-4 flex-row items-center border-b border-slate-50"
    >
      <Avatar name={item.full_name} size="md" />
      <View className="ml-3 flex-1">
        <Text className="font-medium text-slate-900">{item.full_name}</Text>
        <Text className="text-sm text-slate-500">{item.email || 'Sem email'}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {!item.user_id && (
          <Pressable 
            onPress={() => {/* Enviar convite */}}
            className="p-2 bg-emerald-50 rounded-lg"
          >
            <Send size={16} color={colors.primary[600]} />
          </Pressable>
        )}
        <Pressable className="p-2">
          <MoreVertical size={20} color={colors.slate[400]} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Header 
        title="Membros"
        rightAction={
          <Pressable 
            onPress={() => router.push('/(admin)/members/new')}
            className="h-9 w-9 rounded-xl bg-emerald-100 items-center justify-center"
          >
            <Plus size={20} color={colors.primary[600]} />
          </Pressable>
        }
      />

      {/* Busca */}
      <View className="px-4 py-3 bg-white border-b border-slate-100">
        <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2">
          <Search size={20} color={colors.slate[400]} />
          <TextInput
            placeholder="Buscar membro..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-base"
            placeholderTextColor={colors.slate[400]}
          />
        </View>
      </View>

      {/* Stats rápidas */}
      <View className="flex-row px-4 py-3 bg-white border-b border-slate-100">
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-slate-900">{members?.length || 0}</Text>
          <Text className="text-xs text-slate-500">Total</Text>
        </View>
        <View className="flex-1 items-center border-x border-slate-100">
          <Text className="text-lg font-bold text-emerald-600">
            {members?.filter(m => m.user_id).length || 0}
          </Text>
          <Text className="text-xs text-slate-500">Com acesso</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-amber-600">
            {members?.filter(m => !m.user_id).length || 0}
          </Text>
          <Text className="text-xs text-slate-500">Sem convite</Text>
        </View>
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
```

---

### 3. Tesouraria / Finanças

```tsx
// app/(admin)/financial/index.tsx
import { View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuthStore } from '@/stores/authStore';
import { financialService, Transaction } from '@/services/financial';
import { formatDate } from '@/lib/utils';
import { colors } from '@/constants/colors';

export default function FinancialScreen() {
  const router = useRouter();
  const { getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['financial', 'summary', tenant?.id],
    queryFn: () => financialService.getSummary(tenant?.id || ''),
    enabled: !!tenant?.id,
  });

  const { data: transactions } = useQuery({
    queryKey: ['financial', 'transactions', tenant?.id],
    queryFn: () => financialService.getTransactions(tenant?.id || ''),
    enabled: !!tenant?.id,
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando finanças..." />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View className="flex-row items-center py-3 border-b border-slate-50">
      <View className={`h-10 w-10 rounded-xl items-center justify-center ${
        item.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
      }`}>
        {item.type === 'income' ? (
          <ArrowUpRight size={20} color={colors.success} />
        ) : (
          <ArrowDownLeft size={20} color={colors.error} />
        )}
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-medium text-slate-800">{item.description}</Text>
        <Text className="text-xs text-slate-400">{formatDate(item.date)}</Text>
      </View>
      <Text className={`font-semibold ${
        item.type === 'income' ? 'text-emerald-600' : 'text-red-600'
      }`}>
        {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Header 
        title="Tesouraria"
        rightAction={
          <Pressable 
            onPress={() => router.push('/(admin)/financial/new')}
            className="h-9 w-9 rounded-xl bg-emerald-100 items-center justify-center"
          >
            <Plus size={20} color={colors.primary[600]} />
          </Pressable>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Card de Saldo */}
        <View className="px-4 pt-4">
          <LinearGradient
            colors={colors.gradients.premium}
            className="rounded-2xl p-6"
          >
            <View className="flex-row items-center">
              <Wallet size={24} color="white" />
              <Text className="text-white/80 ml-2">Saldo Atual</Text>
            </View>
            <Text className="text-white text-3xl font-bold mt-2">
              {formatCurrency(summary?.balance || 0)}
            </Text>
          </LinearGradient>
        </View>

        {/* Entradas e Saídas do mês */}
        <View className="flex-row px-4 mt-4 gap-3">
          <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100">
            <View className="flex-row items-center">
              <TrendingUp size={18} color={colors.success} />
              <Text className="text-slate-500 ml-2 text-sm">Entradas</Text>
            </View>
            <Text className="text-lg font-bold text-emerald-600 mt-1">
              {formatCurrency(summary?.income || 0)}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100">
            <View className="flex-row items-center">
              <TrendingDown size={18} color={colors.error} />
              <Text className="text-slate-500 ml-2 text-sm">Saídas</Text>
            </View>
            <Text className="text-lg font-bold text-red-600 mt-1">
              {formatCurrency(summary?.expenses || 0)}
            </Text>
          </View>
        </View>

        {/* Últimas Transações */}
        <View className="mt-6 px-4">
          <Text className="font-semibold text-slate-700 mb-3">Últimos Lançamentos</Text>
          <View className="bg-white rounded-2xl px-4 border border-slate-100">
            {transactions?.slice(0, 5).map((t, index) => (
              <View key={t.id}>
                {renderTransaction({ item: t })}
              </View>
            ))}
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
```

---

### 4. Menu "Mais" (Acesso a outras funcionalidades)

```tsx
// app/(admin)/more.tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Award, Calendar, Heart, GraduationCap, 
  Globe, BookOpen, ChevronRight 
} from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { colors } from '@/constants/colors';

export default function MoreScreen() {
  const router = useRouter();

  const menuItems = [
    { 
      icon: Award, 
      label: 'Governança', 
      description: 'Conselhos e reuniões',
      href: '/(admin)/governance',
      color: colors.purple[600]
    },
    { 
      icon: Calendar, 
      label: 'Eventos', 
      description: 'Gerenciar agenda',
      href: '/(admin)/events',
      color: colors.orange[600]
    },
    { 
      icon: Heart, 
      label: 'Devocionais', 
      description: 'Publicar reflexões',
      href: '/(admin)/devotionals',
      color: colors.error
    },
    { 
      icon: GraduationCap, 
      label: 'EBD', 
      description: 'Turmas e alunos',
      href: '/(admin)/ebd',
      color: colors.warning
    },
    { 
      icon: Globe, 
      label: 'Missões', 
      description: 'Missionários apoiados',
      href: '/(admin)/missions',
      color: colors.indigo[600]
    },
    { 
      icon: BookOpen, 
      label: 'Bíblia', 
      description: 'Leitura rápida',
      href: '/(public)/bible',
      color: colors.info
    },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Mais Opções" />

      <ScrollView className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href)}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-slate-100 active:scale-[0.98]"
            >
              <View 
                className="h-12 w-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <Icon size={24} color={item.color} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-slate-900">{item.label}</Text>
                <Text className="text-sm text-slate-500">{item.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.slate[300]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
```

---

### 5. Configurações da Igreja

```tsx
// app/(admin)/settings.tsx
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Church, MapPin, Phone, Mail, Globe, 
  LogOut, User, Lock, ChevronRight 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(public)');
          }
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Configurações" />

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Perfil do Admin */}
        <View className="bg-white px-4 py-5 border-b border-slate-100">
          <View className="flex-row items-center">
            <Avatar name={user?.name} size="lg" />
            <View className="ml-4 flex-1">
              <Text className="font-semibold text-slate-900">{user?.name}</Text>
              <Text className="text-sm text-slate-500">{user?.email}</Text>
              <Text className="text-xs text-emerald-600 mt-1">Administrador</Text>
            </View>
          </View>
        </View>

        {/* Dados da Igreja */}
        <Text className="px-4 py-3 text-sm font-semibold text-slate-500 uppercase">
          Dados da Igreja
        </Text>
        <View className="bg-white border-y border-slate-100">
          <View className="flex-row items-center px-4 py-4 border-b border-slate-50">
            <Church size={20} color={colors.slate[400]} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-slate-400">Nome</Text>
              <Text className="text-slate-800">{tenant?.name}</Text>
            </View>
          </View>
          {tenant?.street && (
            <View className="flex-row items-center px-4 py-4 border-b border-slate-50">
              <MapPin size={20} color={colors.slate[400]} />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-slate-400">Endereço</Text>
                <Text className="text-slate-800">
                  {tenant.street}, {tenant.number} - {tenant.city}/{tenant.state}
                </Text>
              </View>
            </View>
          )}
          {tenant?.phone && (
            <View className="flex-row items-center px-4 py-4 border-b border-slate-50">
              <Phone size={20} color={colors.slate[400]} />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-slate-400">Telefone</Text>
                <Text className="text-slate-800">{tenant.phone}</Text>
              </View>
            </View>
          )}
          {tenant?.email && (
            <View className="flex-row items-center px-4 py-4">
              <Mail size={20} color={colors.slate[400]} />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-slate-400">Email</Text>
                <Text className="text-slate-800">{tenant.email}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Ações */}
        <Text className="px-4 py-3 text-sm font-semibold text-slate-500 uppercase">
          Conta
        </Text>
        <View className="bg-white border-y border-slate-100">
          <Pressable 
            onPress={() => router.push('/(admin)/profile')}
            className="flex-row items-center px-4 py-4 border-b border-slate-50"
          >
            <User size={20} color={colors.slate[600]} />
            <Text className="ml-3 flex-1 text-slate-700">Meu Perfil</Text>
            <ChevronRight size={20} color={colors.slate[300]} />
          </Pressable>
          <Pressable 
            onPress={() => router.push('/(auth)/change-password')}
            className="flex-row items-center px-4 py-4"
          >
            <Lock size={20} color={colors.slate[600]} />
            <Text className="ml-3 flex-1 text-slate-700">Alterar Senha</Text>
            <ChevronRight size={20} color={colors.slate[300]} />
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="mt-6 mx-4 flex-row items-center justify-center py-4 bg-red-50 rounded-xl border border-red-100"
        >
          <LogOut size={20} color={colors.error} />
          <Text className="text-red-600 font-medium ml-2">Sair da conta</Text>
        </Pressable>

        {/* Versão */}
        <Text className="text-center text-xs text-slate-400 mt-6">
          Filadélfias v1.0.0 • Admin
        </Text>
      </ScrollView>
    </View>
  );
}
```

---

## Formulários de Criação

### Novo Membro
```tsx
// app/(admin)/members/new.tsx
// Formulário com campos: nome, email, telefone, data nascimento, gênero, status, ofício
// Usar react-hook-form + zod para validação
```

### Nova Transação Financeira
```tsx
// app/(admin)/financial/new.tsx
// Formulário com campos: tipo (entrada/saída), valor, categoria, descrição, data
```

### Novo Evento
```tsx
// app/(admin)/events/new.tsx
// Formulário com campos: título, descrição, data, horário, local
```

### Novo Devocional
```tsx
// app/(admin)/devotionals/new.tsx
// Formulário com campos: título, referência bíblica, texto, meditação, reflexão, oração
```

---

## Próximos Passos

1. → [08-FASE5-OFFLINE.md](./08-FASE5-OFFLINE.md) - Funcionalidade Offline
