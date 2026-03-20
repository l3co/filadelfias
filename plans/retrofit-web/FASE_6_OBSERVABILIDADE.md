# Fase 6: Observabilidade - Monitoring e Error Tracking

> **Duração:** 2 semanas  
> **Prioridade:** 🟢 Baixo  
> **Dependências:** Fase 4 (Testes estabelecidos)

---

## 🎯 Objetivos

1. Implementar error tracking com Sentry
2. Monitorar Web Vitals e performance
3. Configurar analytics de eventos
4. Implementar logging estruturado
5. Criar dashboard de métricas

---

## 📋 Tarefas Detalhadas

### 6.1 Error Tracking com Sentry

**Objetivo:** Capturar e monitorar erros em produção

#### 6.1.1 Setup Sentry

```bash
npm install @sentry/react
```

```typescript
// apps/web/src/lib/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% das transações
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0, // 100% quando há erro
      
      // Environment
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      
      // Ignore common errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
      
      beforeSend(event, hint) {
        // Sanitize user data
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  }
}
```

```typescript
// apps/web/src/main.tsx
import { initSentry } from './lib/sentry';

initSentry(); // ✅ Inicializar antes do React

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
```

#### 6.1.2 Error Boundary com Sentry

```typescript
// apps/web/src/components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react';
import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log para Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Algo deu errado
            </h1>
            
            <p className="text-gray-600 mb-6">
              Desculpe, encontramos um erro inesperado. Nossa equipe foi notificada.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left bg-gray-100 p-4 rounded-lg mb-4 overflow-auto text-xs">
                {this.state.error.toString()}
              </pre>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline">
                Voltar ao início
              </Button>
              <Button onClick={() => window.location.reload()}>
                Recarregar página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 6.1.3 Contexto de Usuário

```typescript
// apps/web/src/contexts/AuthContext.tsx
import * as Sentry from '@sentry/react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (user) {
      // Enviar contexto de usuário para Sentry
      Sentry.setUser({
        id: user.id,
        username: user.name,
        // NÃO enviar email ou dados sensíveis
      });
      
      Sentry.setContext('tenant', {
        id: user.memberships?.[0]?.tenant?.id,
        name: user.memberships?.[0]?.tenant?.name,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  // ...
}
```

#### 6.1.4 Capturar Erros Manualmente

```typescript
// apps/web/src/services/api.ts
import * as Sentry from '@sentry/react';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log erros HTTP para Sentry
    if (error.response?.status >= 500) {
      Sentry.captureException(error, {
        tags: {
          type: 'http_error',
          status: error.response.status,
        },
        contexts: {
          request: {
            url: error.config?.url,
            method: error.config?.method,
          },
        },
      });
    }
    
    return Promise.reject(error);
  }
);
```

---

### 6.2 Web Vitals Monitoring

**Objetivo:** Monitorar performance real dos usuários

#### 6.2.1 Setup web-vitals

```bash
npm install web-vitals
```

```typescript
// apps/web/src/lib/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import * as Sentry from '@sentry/react';

function sendToAnalytics(metric: any) {
  // Enviar para Sentry
  Sentry.captureMessage(`Web Vital: ${metric.name}`, {
    level: 'info',
    tags: {
      metric: metric.name,
    },
    contexts: {
      web_vitals: {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      },
    },
  });

  // Também pode enviar para Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

```typescript
// apps/web/src/main.tsx
import { initWebVitals } from './lib/web-vitals';

initSentry();
initWebVitals(); // ✅ Monitorar Web Vitals

createRoot(document.getElementById('root')!).render(/* ... */);
```

---

### 6.3 Analytics de Eventos

**Objetivo:** Rastrear comportamento do usuário

#### 6.3.1 Setup Analytics (PostHog ou Mixpanel)

```bash
npm install posthog-js
```

```typescript
// apps/web/src/lib/analytics.ts
import posthog from 'posthog-js';

export function initAnalytics() {
  if (import.meta.env.PROD) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      autocapture: false, // Controle manual
      capture_pageview: false, // Controle manual
    });
  }
}

export const analytics = {
  // Page views
  pageView: (path: string) => {
    posthog.capture('$pageview', { path });
  },

  // User identification
  identify: (userId: string, traits?: Record<string, any>) => {
    posthog.identify(userId, traits);
  },

  // Custom events
  track: (event: string, properties?: Record<string, any>) => {
    posthog.capture(event, properties);
  },

  // Reset on logout
  reset: () => {
    posthog.reset();
  },
};

// Type-safe event tracking
export const trackEvent = {
  // Auth
  login: () => analytics.track('user_logged_in'),
  logout: () => analytics.track('user_logged_out'),
  signUp: () => analytics.track('user_signed_up'),

  // Members
  memberCreated: () => analytics.track('member_created'),
  memberEdited: () => analytics.track('member_edited'),
  memberInvited: () => analytics.track('member_invited'),

  // Events
  eventCreated: () => analytics.track('event_created'),
  eventViewed: (eventId: string) => analytics.track('event_viewed', { event_id: eventId }),

  // Financial
  titheRecorded: (amount: number) => analytics.track('tithe_recorded', { amount }),
  expenseCreated: (amount: number) => analytics.track('expense_created', { amount }),

  // Feature usage
  featureUsed: (feature: string) => analytics.track('feature_used', { feature }),
};
```

#### 6.3.2 Integrar no App

```typescript
// apps/web/src/App.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from './lib/analytics';

function App() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    analytics.pageView(location.pathname);
  }, [location]);

  return (/* ... */);
}
```

```typescript
// apps/web/src/contexts/AuthContext.tsx
import { analytics, trackEvent } from '../lib/analytics';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (user) {
      analytics.identify(user.id, {
        name: user.name,
        role: user.memberships?.[0]?.role,
      });
    } else {
      analytics.reset();
    }
  }, [user]);

  // ...
}
```

```typescript
// apps/web/src/features/members/hooks/useMembers.ts
import { trackEvent } from '../../../lib/analytics';

export function useCreateMember(tenantId: string | undefined) {
  return useMutation({
    mutationFn: (data: MemberCreateData) => membersService.createMember(tenantId!, data),
    onSuccess: () => {
      trackEvent.memberCreated(); // ✅ Track evento
      toast.success('Membro criado com sucesso!');
    },
  });
}
```

---

### 6.4 Logging Estruturado

**Objetivo:** Logs consistentes e pesquisáveis

```typescript
// apps/web/src/lib/logger.ts
import * as Sentry from '@sentry/react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (import.meta.env.PROD && level === 'debug') {
      return false;
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message, context));
    
    // Enviar para Sentry como breadcrumb
    Sentry.addBreadcrumb({
      category: 'info',
      message,
      level: 'info',
      data: context,
    });
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context));
    
    Sentry.addBreadcrumb({
      category: 'warning',
      message,
      level: 'warning',
      data: context,
    });
  }

  error(message: string, error?: Error, context?: LogContext) {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, context), error);
    
    // Capturar erro no Sentry
    Sentry.captureException(error || new Error(message), {
      contexts: {
        custom: context,
      },
    });
  }
}

export const logger = new Logger();
```

**Uso:**

```typescript
// apps/web/src/features/members/hooks/useMembers.ts
import { logger } from '../../../lib/logger';

export function useMembers(tenantId: string | undefined) {
  return useQuery({
    queryKey: [MEMBERS_QUERY_KEY, tenantId],
    queryFn: async () => {
      logger.info('Fetching members', { tenantId });
      
      try {
        const members = await membersService.listMembers(tenantId!);
        logger.debug('Members fetched successfully', { count: members.length });
        return members;
      } catch (error) {
        logger.error('Failed to fetch members', error as Error, { tenantId });
        throw error;
      }
    },
    enabled: !!tenantId,
  });
}
```

---

### 6.5 Performance Monitoring

#### 6.5.1 Custom Performance Marks

```typescript
// apps/web/src/lib/performance.ts
export const perf = {
  mark: (name: string) => {
    performance.mark(name);
  },

  measure: (name: string, startMark: string, endMark?: string) => {
    try {
      const measure = performance.measure(name, startMark, endMark);
      
      // Log medição
      console.info(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
      
      // Enviar para Sentry se > 1s
      if (measure.duration > 1000) {
        Sentry.captureMessage(`Slow operation: ${name}`, {
          level: 'warning',
          tags: {
            type: 'performance',
          },
          contexts: {
            performance: {
              duration: measure.duration,
              name,
            },
          },
        });
      }
      
      return measure;
    } catch (e) {
      // Mark não encontrado
      console.warn(`Failed to measure ${name}`, e);
    }
  },

  // Helper para medir função
  measureFn: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    perf.mark(startMark);
    const result = await fn();
    perf.mark(endMark);
    perf.measure(name, startMark, endMark);
    
    return result;
  },
};
```

**Uso:**

```typescript
// apps/web/src/features/members/hooks/useMembers.ts
import { perf } from '../../../lib/performance';

export function useMembers(tenantId: string | undefined) {
  return useQuery({
    queryKey: [MEMBERS_QUERY_KEY, tenantId],
    queryFn: () => perf.measureFn(
      'fetch-members',
      () => membersService.listMembers(tenantId!)
    ),
    enabled: !!tenantId,
  });
}
```

---

### 6.6 Dashboard de Métricas

**Objetivo:** Visualizar métricas em tempo real

#### 6.6.1 Sentry Dashboard

1. **Errors por feature**
2. **Performance por rota**
3. **Web Vitals trends**
4. **User feedback**

#### 6.6.2 Analytics Dashboard (PostHog)

1. **Funnel de conversão** (signup → onboarding → feature usage)
2. **Retention cohorts**
3. **Feature adoption**
4. **User paths**

#### 6.6.3 Custom Internal Dashboard (Opcional)

```typescript
// apps/web/src/routes/admin/MetricsPage.tsx
export function MetricsPage() {
  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const response = await api.get('/admin/metrics');
      return response.data;
    },
    refetchInterval: 60000, // 1min
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Métricas do Sistema" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Usuários Ativos (7d)"
          value={metrics?.activeUsers7d}
          trend="+12%"
        />
        <MetricCard
          title="Erros (24h)"
          value={metrics?.errors24h}
          trend="-5%"
          variant="error"
        />
        <MetricCard
          title="Tempo Médio de Resposta"
          value={`${metrics?.avgResponseTime}ms`}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorsChart data={metrics?.errorsByDay} />
        <WebVitalsChart data={metrics?.webVitals} />
      </div>
    </div>
  );
}
```

---

## 📊 Métricas de Sucesso

### Error Tracking

- **Error capture rate:** 100% de erros capturados
- **MTTR (Mean Time To Resolution):** <24h para critical
- **Error rate:** <0.1% de requests
- **Resolved errors:** >90% em 7 dias

### Performance

- **LCP:** <2.5s (p75)
- **FID:** <100ms (p75)
- **CLS:** <0.1 (p75)
- **API response time:** <500ms (p95)

### Analytics

- **Event tracking coverage:** 100% de ações críticas
- **Data accuracy:** >95%
- **Dashboard usage:** 5+ views/week por admin

---

## 📦 Entregáveis

1. ✅ Sentry configurado e testado
2. ✅ Error Boundary com fallback
3. ✅ Web Vitals monitoring
4. ✅ PostHog analytics setup
5. ✅ Event tracking em features críticas
6. ✅ Logger estruturado
7. ✅ Performance monitoring
8. ✅ Dashboard de métricas

---

## 🔄 Checklist de Implementação

- [ ] Criar branch `retrofit/fase-6-observabilidade`
- [ ] Criar conta Sentry
- [ ] Configurar Sentry SDK
- [ ] Implementar Error Boundary
- [ ] Adicionar user context
- [ ] Setup Web Vitals
- [ ] Criar conta PostHog
- [ ] Configurar PostHog SDK
- [ ] Implementar trackEvent helpers
- [ ] Adicionar tracking em features
- [ ] Criar logger estruturado
- [ ] Adicionar logs em hooks
- [ ] Performance marks em operações lentas
- [ ] Configurar alertas no Sentry
- [ ] Criar dashboard básico
- [ ] Documentar como usar analytics
- [ ] Code review
- [ ] Merge para main

---

## 📅 Timeline Sugerido

| Semana | Tarefas |
|--------|---------|
| **1** | Sentry + Error Boundary + Web Vitals |
| **2** | Analytics + Logging + Dashboard |

---

## 🎓 Recursos

- [Sentry React Guide](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Web Vitals](https://web.dev/vitals/)
- [PostHog Documentation](https://posthog.com/docs)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
