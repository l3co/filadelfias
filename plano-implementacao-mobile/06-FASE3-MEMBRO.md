# 👤 Fase 3: Portal do Membro

## Objetivo
Implementar todas as telas do portal do membro, espelhando a versão web.

---

## Layout do Membro

```tsx
// app/(member)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Heart, BookOpen, MessageCircle, User } from 'lucide-react-native';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { colors } from '@/constants/colors';

export default function MemberLayout() {
  return (
    <ProtectedRoute>
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
            title: 'Início',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="devotionals"
          options={{
            title: 'Devocionais',
            tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bible"
          options={{
            title: 'Bíblia',
            tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="prayer"
          options={{
            title: 'Oração',
            tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
```

---

## Telas a Implementar

### 1. Dashboard Home (Membro)

```tsx
// app/(member)/index.tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  BookOpen, BookMarked, Heart, Users, Calendar, 
  Globe, GraduationCap, MessageCircle, Bell 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { HomeCard } from '@/components/ui/HomeCard';
import { Avatar } from '@/components/ui/Avatar';
import { colors } from '@/constants/colors';

export default function MemberHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();

  const features = [
    { icon: BookOpen, title: 'Bíblia Online', description: 'Leia a Palavra de Deus', href: '/(member)/bible', color: 'blue' as const },
    { icon: BookMarked, title: 'Manual IPB', description: 'Princípios da nossa fé', href: '/(public)/manual', color: 'purple' as const },
    { icon: Heart, title: 'Devocionais', description: 'Reflexões diárias', href: '/(member)/devotionals', color: 'red' as const },
    { icon: Users, title: 'Membros', description: 'Diretório da igreja', href: '/(member)/directory', color: 'emerald' as const },
    { icon: Calendar, title: 'Eventos', description: 'Próximas atividades', href: '/(member)/events', color: 'orange' as const },
    { icon: Globe, title: 'Missões', description: 'Nossos missionários', href: '/(member)/missions', color: 'indigo' as const },
    { icon: GraduationCap, title: 'EBD', description: 'Sua turma e estudos', href: '/(member)/ebd', color: 'yellow' as const },
    { icon: MessageCircle, title: 'Oração', description: 'Pedidos de oração', href: '/(member)/prayer', color: 'pink' as const },
  ];

  // Acrônimo da igreja
  const churchAcronym = tenant?.name
    ?.split(' ')
    .filter(word => word.length > 2 && word[0] === word[0].toUpperCase())
    .map(word => word[0])
    .join('')
    .slice(0, 3) || 'IP';

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Premium */}
      <LinearGradient
        colors={colors.gradients.primary}
        className="px-4 pb-6 rounded-b-3xl"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          {/* Logo da Igreja */}
          <View className="flex-row items-center">
            <View className="h-10 w-10 rounded-xl bg-white/20 items-center justify-center">
              <Text className="text-white font-bold text-sm">{churchAcronym}</Text>
            </View>
            <View className="ml-3">
              <Text className="text-white/80 text-xs">Portal do Membro</Text>
              <Text className="text-white font-semibold">{tenant?.name}</Text>
            </View>
          </View>
          
          {/* Notificações e Avatar */}
          <View className="flex-row items-center gap-2">
            <Pressable className="p-2 relative">
              <Bell size={22} color="white" />
              <View className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400" />
            </Pressable>
            <Pressable onPress={() => router.push('/(member)/profile')}>
              <Avatar name={user?.name} size="md" />
            </Pressable>
          </View>
        </View>

        {/* Boas-vindas */}
        <View className="mt-2">
          <Text className="text-white/80 text-sm">Olá,</Text>
          <Text className="text-white text-2xl font-bold">
            {user?.name?.split(' ')[0]}! 👋
          </Text>
          <Text className="text-white/70 mt-1">
            O que você gostaria de fazer hoje?
          </Text>
        </View>
      </LinearGradient>

      {/* Grid de Cards */}
      <ScrollView 
        className="flex-1 px-4 -mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="flex-row flex-wrap justify-between">
          {features.map((feature) => (
            <View key={feature.href} className="w-[48%] mb-3">
              <HomeCard {...feature} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
```

---

### 2. Devocionais

```tsx
// app/(member)/devotionals.tsx
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Heart, Calendar, ChevronRight } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { devotionalsService, Devotional } from '@/services/devotionals';
import { formatDate } from '@/lib/utils';
import { colors } from '@/constants/colors';

export default function DevotionalsScreen() {
  const router = useRouter();
  const { getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();

  const { data: devotionals, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['devotionals', tenant?.id],
    queryFn: () => devotionalsService.getAll(tenant?.id || ''),
    enabled: !!tenant?.id,
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando devocionais..." />;
  }

  const renderDevotional = ({ item }: { item: Devotional }) => (
    <Pressable
      onPress={() => router.push(`/(member)/devotionals/${item.id}`)}
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 active:scale-[0.98]"
    >
      <View className="flex-row items-start">
        <View className="h-12 w-12 rounded-xl bg-red-50 items-center justify-center">
          <Heart size={24} color={colors.error} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-slate-900 text-base" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-sm text-emerald-600 mt-1">
            {item.verse_reference}
          </Text>
          <View className="flex-row items-center mt-2">
            <Calendar size={14} color={colors.slate[400]} />
            <Text className="text-xs text-slate-400 ml-1">
              {formatDate(item.date)}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.slate[300]} />
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Devocionais" showNotifications showProfile />

      {devotionals?.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nenhum devocional"
          description="Os devocionais aparecerão aqui quando forem publicados."
        />
      ) : (
        <FlatList
          data={devotionals}
          renderItem={renderDevotional}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary[600]}
            />
          }
        />
      )}
    </View>
  );
}
```

---

### 3. Pedidos de Oração

```tsx
// app/(member)/prayer.tsx
import { View, Text, FlatList, Pressable, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Plus, Heart, X, Send } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { prayerService, PrayerRequest } from '@/services/prayer';
import { formatDate } from '@/lib/utils';
import { colors } from '@/constants/colors';
import { toast } from '@/lib/toast';

export default function PrayerScreen() {
  const queryClient = useQueryClient();
  const { getCurrentTenant, user } = useAuthStore();
  const tenant = getCurrentTenant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['prayer', tenant?.id],
    queryFn: () => prayerService.getAll(tenant?.id || ''),
    enabled: !!tenant?.id,
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => 
      prayerService.create(tenant?.id || '', { content, is_anonymous: isAnonymous }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer', tenant?.id] });
      setIsModalOpen(false);
      setNewRequest('');
      toast.success('Pedido enviado!');
    },
    onError: () => toast.error('Erro ao enviar pedido'),
  });

  const prayMutation = useMutation({
    mutationFn: (requestId: string) => prayerService.pray(tenant?.id || '', requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer', tenant?.id] });
    },
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando pedidos..." />;
  }

  const renderRequest = ({ item }: { item: PrayerRequest }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
      <View className="flex-row items-start">
        <View className="h-10 w-10 rounded-full bg-pink-50 items-center justify-center">
          <MessageCircle size={20} color={colors.pink[500]} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-sm text-slate-500">
            {item.is_anonymous ? 'Anônimo' : item.author_name}
          </Text>
          <Text className="text-slate-800 mt-1">{item.content}</Text>
          <Text className="text-xs text-slate-400 mt-2">{formatDate(item.created_at)}</Text>
        </View>
      </View>
      
      <Pressable
        onPress={() => prayMutation.mutate(item.id)}
        className="flex-row items-center justify-center mt-3 py-2 bg-pink-50 rounded-xl"
      >
        <Heart 
          size={18} 
          color={colors.pink[500]} 
          fill={item.prayed_by_me ? colors.pink[500] : 'transparent'}
        />
        <Text className="text-pink-600 font-medium ml-2">
          {item.prayer_count} {item.prayer_count === 1 ? 'oração' : 'orações'}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Header 
        title="Pedidos de Oração" 
        rightAction={
          <Pressable 
            onPress={() => setIsModalOpen(true)}
            className="h-9 w-9 rounded-xl bg-emerald-100 items-center justify-center"
          >
            <Plus size={20} color={colors.primary[600]} />
          </Pressable>
        }
      />

      {requests?.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Nenhum pedido"
          description="Seja o primeiro a compartilhar um pedido de oração."
          action={
            <Button onPress={() => setIsModalOpen(true)}>
              Novo Pedido
            </Button>
          }
        />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de Novo Pedido */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
            <Pressable onPress={() => setIsModalOpen(false)}>
              <X size={24} color={colors.slate[600]} />
            </Pressable>
            <Text className="text-lg font-bold text-slate-900">Novo Pedido</Text>
            <Pressable 
              onPress={() => createMutation.mutate(newRequest)}
              disabled={!newRequest.trim() || createMutation.isPending}
            >
              <Send size={24} color={newRequest.trim() ? colors.primary[600] : colors.slate[300]} />
            </Pressable>
          </View>

          <View className="p-4 flex-1">
            <TextInput
              placeholder="Compartilhe seu pedido de oração..."
              value={newRequest}
              onChangeText={setNewRequest}
              multiline
              numberOfLines={6}
              className="text-lg text-slate-800 leading-7"
              placeholderTextColor={colors.slate[400]}
              textAlignVertical="top"
            />
          </View>

          <View className="p-4 border-t border-slate-100">
            <Pressable
              onPress={() => setIsAnonymous(!isAnonymous)}
              className="flex-row items-center"
            >
              <View className={`h-5 w-5 rounded border-2 items-center justify-center ${isAnonymous ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                {isAnonymous && <Text className="text-white text-xs">✓</Text>}
              </View>
              <Text className="ml-2 text-slate-700">Enviar anonimamente</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
```

---

### 4. Diretório de Membros

```tsx
// app/(member)/directory.tsx
import { View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, User, Phone, Mail } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { membersService, Member } from '@/services/members';
import { colors } from '@/constants/colors';

export default function DirectoryScreen() {
  const { getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();
  const [search, setSearch] = useState('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', tenant?.id],
    queryFn: () => membersService.getAll(tenant?.id || ''),
    enabled: !!tenant?.id,
  });

  const filteredMembers = members?.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <LoadingScreen message="Carregando membros..." />;
  }

  const renderMember = ({ item }: { item: Member }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
      <View className="flex-row items-center">
        <Avatar name={item.full_name} size="lg" />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-slate-900">{item.full_name}</Text>
          {item.email && (
            <View className="flex-row items-center mt-1">
              <Mail size={14} color={colors.slate[400]} />
              <Text className="text-sm text-slate-500 ml-1">{item.email}</Text>
            </View>
          )}
          {item.phone && (
            <View className="flex-row items-center mt-1">
              <Phone size={14} color={colors.slate[400]} />
              <Text className="text-sm text-slate-500 ml-1">{item.phone}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Diretório" showProfile />

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

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className="text-sm text-slate-500 mb-3">
            {filteredMembers?.length || 0} membros encontrados
          </Text>
        }
      />
    </View>
  );
}
```

---

### 5. Eventos

```tsx
// app/(member)/events.tsx
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock } from 'lucide-react-native';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { eventsService, Event } from '@/services/events';
import { formatDate } from '@/lib/utils';
import { colors } from '@/constants/colors';

export default function EventsScreen() {
  const { getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', tenant?.id],
    queryFn: () => eventsService.getAll(tenant?.id || ''),
    enabled: !!tenant?.id,
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando eventos..." />;
  }

  const renderEvent = ({ item }: { item: Event }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
      <View className="flex-row">
        {/* Data Box */}
        <View className="h-16 w-16 rounded-xl bg-orange-50 items-center justify-center mr-4">
          <Text className="text-2xl font-bold text-orange-600">
            {new Date(item.date).getDate()}
          </Text>
          <Text className="text-xs text-orange-500 uppercase">
            {new Date(item.date).toLocaleDateString('pt-BR', { month: 'short' })}
          </Text>
        </View>
        
        <View className="flex-1">
          <Text className="font-semibold text-slate-900 text-base">{item.title}</Text>
          
          {item.time && (
            <View className="flex-row items-center mt-2">
              <Clock size={14} color={colors.slate[400]} />
              <Text className="text-sm text-slate-500 ml-1">{item.time}</Text>
            </View>
          )}
          
          {item.location && (
            <View className="flex-row items-center mt-1">
              <MapPin size={14} color={colors.slate[400]} />
              <Text className="text-sm text-slate-500 ml-1">{item.location}</Text>
            </View>
          )}
        </View>
      </View>
      
      {item.description && (
        <Text className="text-slate-600 mt-3" numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Eventos" showProfile />

      {events?.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhum evento"
          description="Não há eventos agendados no momento."
        />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
```

---

### 6. Perfil do Membro

```tsx
// app/(member)/profile.tsx
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, Mail, Phone, LogOut, ChevronRight, 
  Lock, Bell, Download, Trash2 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

export default function ProfileScreen() {
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

  const menuItems = [
    { icon: Lock, label: 'Alterar senha', onPress: () => router.push('/(auth)/change-password') },
    { icon: Bell, label: 'Notificações', onPress: () => {} },
    { icon: Download, label: 'Conteúdo offline', onPress: () => router.push('/(public)/downloads') },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Meu Perfil" showBack />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Avatar e Info */}
        <View className="bg-white px-6 py-8 items-center border-b border-slate-100">
          <Avatar name={user?.name} size="xl" />
          <Text className="text-xl font-bold text-slate-900 mt-4">{user?.name}</Text>
          <Text className="text-slate-500">{tenant?.name}</Text>
          
          <View className="flex-row items-center mt-4 gap-4">
            {user?.email && (
              <View className="flex-row items-center">
                <Mail size={16} color={colors.slate[400]} />
                <Text className="text-sm text-slate-500 ml-1">{user.email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View className="mt-4 bg-white border-y border-slate-100">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                className={`flex-row items-center px-6 py-4 ${index > 0 ? 'border-t border-slate-50' : ''}`}
              >
                <Icon size={20} color={colors.slate[600]} />
                <Text className="flex-1 ml-3 text-slate-700">{item.label}</Text>
                <ChevronRight size={20} color={colors.slate[300]} />
              </Pressable>
            );
          })}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="mt-4 mx-4 flex-row items-center justify-center py-4 bg-red-50 rounded-xl"
        >
          <LogOut size={20} color={colors.error} />
          <Text className="text-red-600 font-medium ml-2">Sair da conta</Text>
        </Pressable>

        {/* Versão */}
        <Text className="text-center text-xs text-slate-400 mt-8">
          Filadélfias v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
```

---

### 7. Missões e EBD

Seguem o mesmo padrão dos componentes acima, consultando seus respectivos services.

---

## Services Necessários

Copiar de `apps/web/src/services/`:
- `devotionals.ts`
- `prayer.ts`  
- `members.ts`
- `events.ts`
- `missions.ts`
- `ebd.ts`

**Ajuste necessário em todos:**
```typescript
// Antes (web)
import { api } from '../lib/api';

// Depois (mobile)
import { api } from '@/services/api';
```

---

## Próximos Passos

1. → [07-FASE4-ADMIN.md](./07-FASE4-ADMIN.md) - Área Administrativa
