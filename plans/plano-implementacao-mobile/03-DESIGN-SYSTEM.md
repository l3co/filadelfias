# 🎨 Design System

## Paleta de Cores

Mesma paleta da versão web para manter consistência visual.

```typescript
// src/constants/colors.ts
export const colors = {
  // Primária (Emerald/Teal - identidade Filadélfias)
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Tons neutros (Slate)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Feedback
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Background
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  
  // Gradientes (para usar com LinearGradient)
  gradients: {
    primary: ['#059669', '#0d9488'],
    premium: ['#059669', '#047857'],
    dark: ['#1e293b', '#0f172a'],
  },
};
```

---

## Tipografia

```typescript
// src/constants/typography.ts
export const typography = {
  // Tamanhos
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Pesos
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

---

## Componentes Base

### Button
```tsx
// src/components/ui/Button.tsx
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/utils';
import { colors } from '@/constants/colors';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={cn(
          'rounded-xl overflow-hidden',
          isDisabled && 'opacity-50',
          className
        )}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={cn('flex-row items-center justify-center', sizeStyles[size])}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              {icon && <View className="mr-2">{icon}</View>}
              <Text className={cn('font-semibold text-white', textSizes[size])}>
                {children}
              </Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const variantStyles = {
    secondary: 'bg-slate-100 active:bg-slate-200',
    outline: 'border-2 border-emerald-600 bg-transparent active:bg-emerald-50',
    ghost: 'bg-transparent active:bg-slate-100',
    destructive: 'bg-red-500 active:bg-red-600',
  };

  const textStyles = {
    secondary: 'text-slate-700',
    outline: 'text-emerald-600',
    ghost: 'text-slate-600',
    destructive: 'text-white',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center rounded-xl',
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && 'opacity-50',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'destructive' ? 'white' : colors.primary[600]} 
          size="small" 
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={cn('font-semibold', textSizes[size], textStyles[variant])}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}
```

### Card
```tsx
// src/components/ui/Card.tsx
import { View, Pressable } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  variant?: 'default' | 'elevated' | 'outline';
}

export function Card({ children, onPress, className, variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg shadow-slate-200',
    outline: 'bg-white border border-slate-200',
  };

  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      className={cn(
        'rounded-2xl p-4',
        variantStyles[variant],
        onPress && 'active:scale-[0.98] active:opacity-90',
        className
      )}
    >
      {children}
    </Component>
  );
}
```

### Input
```tsx
// src/components/ui/Input.tsx
import { View, TextInput, Text } from 'react-native';
import { cn } from '@/lib/utils';
import { colors } from '@/constants/colors';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: React.ReactNode;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  className,
}: InputProps) {
  return (
    <View className={cn('mb-4', className)}>
      {label && (
        <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
      )}
      <View
        className={cn(
          'flex-row items-center bg-slate-50 rounded-xl border-2 px-4',
          error ? 'border-red-500' : 'border-transparent focus:border-emerald-500'
        )}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.slate[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          className="flex-1 py-3.5 text-base text-slate-900"
        />
      </View>
      {error && <Text className="text-sm text-red-500 mt-1">{error}</Text>}
    </View>
  );
}
```

### HomeCard (mesmo padrão da web)
```tsx
// src/components/ui/HomeCard.tsx
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface HomeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: 'blue' | 'purple' | 'red' | 'emerald' | 'orange' | 'indigo' | 'yellow' | 'pink';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
  purple: { bg: 'bg-purple-50', icon: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'] },
  red: { bg: 'bg-red-50', icon: '#ef4444', gradient: ['#ef4444', '#dc2626'] },
  emerald: { bg: 'bg-emerald-50', icon: '#10b981', gradient: ['#10b981', '#059669'] },
  orange: { bg: 'bg-orange-50', icon: '#f97316', gradient: ['#f97316', '#ea580c'] },
  indigo: { bg: 'bg-indigo-50', icon: '#6366f1', gradient: ['#6366f1', '#4f46e5'] },
  yellow: { bg: 'bg-yellow-50', icon: '#eab308', gradient: ['#eab308', '#ca8a04'] },
  pink: { bg: 'bg-pink-50', icon: '#ec4899', gradient: ['#ec4899', '#db2777'] },
};

export function HomeCard({ icon: Icon, title, description, href, color }: HomeCardProps) {
  const router = useRouter();
  const colorConfig = colorMap[color];

  return (
    <Pressable
      onPress={() => router.push(href)}
      className="active:scale-[0.97] active:opacity-90"
    >
      <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100">
        <View className={cn('h-12 w-12 rounded-xl items-center justify-center mb-3', colorConfig.bg)}>
          <Icon size={24} color={colorConfig.icon} />
        </View>
        <Text className="font-semibold text-slate-900 text-base mb-1">{title}</Text>
        <Text className="text-sm text-slate-500 leading-5">{description}</Text>
      </View>
    </Pressable>
  );
}
```

### Avatar
```tsx
// src/components/ui/Avatar.tsx
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { colors } from '@/constants/colors';

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { container: 'h-8 w-8', text: 'text-xs' },
  md: { container: 'h-10 w-10', text: 'text-sm' },
  lg: { container: 'h-12 w-12', text: 'text-base' },
  xl: { container: 'h-16 w-16', text: 'text-xl' },
};

export function Avatar({ name, imageUrl, size = 'md', className }: AvatarProps) {
  const sizeConfig = sizeMap[size];

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={cn('rounded-xl', sizeConfig.container, className)}
      />
    );
  }

  return (
    <LinearGradient
      colors={colors.gradients.primary}
      className={cn('rounded-xl items-center justify-center', sizeConfig.container, className)}
    >
      <Text className={cn('font-bold text-white', sizeConfig.text)}>
        {getInitials(name || 'U')}
      </Text>
    </LinearGradient>
  );
}
```

### LoadingScreen
```tsx
// src/components/ui/LoadingScreen.tsx
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '@/constants/colors';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color={colors.primary[600]} />
      <Text className="mt-4 text-slate-500">{message}</Text>
    </View>
  );
}
```

### EmptyState
```tsx
// src/components/ui/EmptyState.tsx
import { View, Text } from 'react-native';
import { LucideIcon, Inbox } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="h-16 w-16 rounded-2xl bg-slate-100 items-center justify-center mb-4">
        <Icon size={32} color={colors.slate[400]} />
      </View>
      <Text className="text-lg font-semibold text-slate-700 text-center">{title}</Text>
      {description && (
        <Text className="text-sm text-slate-500 text-center mt-2">{description}</Text>
      )}
      {action && <View className="mt-4">{action}</View>}
    </View>
  );
}
```

---

## Layouts

### Header Padrão
```tsx
// src/components/layout/Header.tsx
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
  showNotifications?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ 
  title, 
  showBack, 
  showProfile, 
  showNotifications,
  rightAction 
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  return (
    <View 
      className="bg-white border-b border-slate-100 px-4"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between h-14">
        {/* Left */}
        <View className="flex-row items-center">
          {showBack && (
            <Pressable 
              onPress={() => router.back()}
              className="mr-3 -ml-2 p-2"
            >
              <ChevronLeft size={24} color={colors.slate[600]} />
            </Pressable>
          )}
          {title && (
            <Text className="text-lg font-semibold text-slate-900">{title}</Text>
          )}
        </View>

        {/* Right */}
        <View className="flex-row items-center gap-2">
          {showNotifications && (
            <Pressable className="p-2 relative">
              <Bell size={22} color={colors.slate[600]} />
              <View className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
            </Pressable>
          )}
          {showProfile && (
            <Pressable onPress={() => router.push('/profile')}>
              <Avatar name={user?.name} size="sm" />
            </Pressable>
          )}
          {rightAction}
        </View>
      </View>
    </View>
  );
}
```

### TabBar Personalizada
```tsx
// src/components/layout/TabBar.tsx
import { View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, BookMarked, Heart, User } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import { cn } from '@/lib/utils';
import { colors } from '@/constants/colors';

const tabs = [
  { href: '/(member)', icon: Home, label: 'Início' },
  { href: '/(member)/devotionals', icon: Heart, label: 'Devocionais' },
  { href: '/(public)/bible', icon: BookOpen, label: 'Bíblia' },
  { href: '/(public)/manual', icon: BookMarked, label: 'Manual' },
  { href: '/(member)/profile', icon: User, label: 'Perfil' },
];

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="flex-row bg-white border-t border-slate-100"
      style={{ paddingBottom: insets.bottom }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        const Icon = tab.icon;
        
        return (
          <Pressable
            key={tab.href}
            onPress={() => router.push(tab.href)}
            className="flex-1 items-center py-2"
          >
            <Icon 
              size={22} 
              color={isActive ? colors.primary[600] : colors.slate[400]} 
            />
            <Text 
              className={cn(
                'text-xs mt-1',
                isActive ? 'text-emerald-600 font-medium' : 'text-slate-400'
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
```

---

## Próximos Passos

1. → [04-FASE1-PUBLICO.md](./04-FASE1-PUBLICO.md) - Implementação da área pública
