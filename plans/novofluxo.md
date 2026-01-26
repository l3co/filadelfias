# Plano: Novo Fluxo de Login - Membro como Experiência Padrão

## Contexto

Atualmente, quando um administrador faz login, ele é redirecionado diretamente para o painel administrativo (`/app`). Isso cria uma experiência focada em gestão, mas ignora que muitos administradores também são membros que querem usar recursos como Bíblia, Hinário, Devocionais, etc.

### Problemas Identificados

1. **Experiência fragmentada**: Administradores não têm acesso fácil aos recursos de membro
2. **Foco excessivo em gestão**: Nem sempre o usuário quer administrar quando acessa a plataforma
3. **Inconsistência de rotas**: Rotas de membro estão em português (`/membro/biblia`), rotas de admin em inglês (`/app/members`)

### Solução Proposta

Todos os usuários (membros e admins) devem cair na experiência de membro após login. Administradores terão um card/botão para "Acessar Modo Admin" quando necessário.

---

## Fase 1: Padronização de Rotas

### 1.1 Decisão de Idioma

**Padrão do Projeto**:
- **Rotas, variáveis, funções, documentação**: Inglês
- **Textos exibidos na UI**: Português

```
/member/home
/member/bible
/member/hymnal
/admin/members
/admin/treasury
/admin/governance
```

**Decisão**: Todas as rotas e código em inglês. Apenas textos de exibição (labels, mensagens, títulos) em português.

### 1.2 Mapeamento de Rotas

| Rota Atual (Admin) | Nova Rota (Admin) |
|-------------------|-------------------|
| `/app` | `/admin` |
| `/app/members` | `/admin/members` |
| `/app/financial` | `/admin/treasury` |
| `/app/governance` | `/admin/governance` |
| `/app/missions` | `/admin/missions` |
| `/app/ebd` | `/admin/education` |
| `/app/events` | `/admin/events` |
| `/app/settings` | `/admin/settings` |

| Rota Atual (Membro) | Nova Rota (Membro) |
|--------------------|-------------------|
| `/membro` | `/member` |
| `/membro/biblia` | `/member/bible` |
| `/membro/hinario` | `/member/hymnal` |
| `/membro/dizimos` | `/member/tithes` |
| `/membro/devocionais` | `/member/devotionals` |
| `/membro/oracao` | `/member/prayer` |
| `/membro/diretorio` | `/member/directory` |
| `/membro/manual` | `/member/manual` |
| `/membro/ebd` | `/member/education` |
| `/membro/governanca` | `/member/governance` |

### 1.3 Arquivos a Modificar

```
apps/web/src/App.tsx                    # Definição de rotas
apps/web/src/components/Sidebar.tsx     # Links de navegação admin
apps/web/src/components/MemberLayout.tsx # Links de navegação membro
apps/web/src/hooks/useAuth.ts           # Lógica de redirecionamento
```

---

## Fase 2: Novo Fluxo de Autenticação

### 2.1 Fluxo Atual
```
Login → Verifica Role → Admin? → /app
                      → Membro? → /membro
```

### 2.2 Novo Fluxo
```
Login → Sempre → /member
              → Se Admin/Tesoureiro/etc → Mostra card "Acessar Administração"
```

### 2.3 Componente: Card de Acesso Admin

Criar componente `AdminAccessCard` que aparece na página inicial do membro quando o usuário tem permissões administrativas.

```tsx
// apps/web/src/components/AdminAccessCard.tsx
interface AdminAccessCardProps {
  userRole: string;
}

export function AdminAccessCard({ userRole }: AdminAccessCardProps) {
  const adminRoles = ['ADMIN', 'PASTOR', 'TESOUREIRO', 'PRESBITERO', 'DIACONO', 'SECRETARIO'];
  
  if (!adminRoles.includes(userRole)) return null;
  
  return (
    <Card>
      <CardHeader>
        <Settings className="h-6 w-6" />
        <CardTitle>Modo Administração</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Acesse o painel administrativo para gerenciar a igreja.</p>
        <Button asChild>
          <Link to="/admin">Acessar Administração</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 2.4 Modificar MemberHomePage

Adicionar o `AdminAccessCard` na página inicial do membro:

```tsx
// apps/web/src/routes/member/MemberHomePage.tsx
export function MemberHomePage() {
  const { membership } = useAuth();
  
  return (
    <div>
      <AdminAccessCard userRole={membership?.role} />
      <QuickActions />
      <RecentActivity />
    </div>
  );
}
```

### 2.5 Modificar Lógica de Redirecionamento

```tsx
// apps/web/src/hooks/useAuth.ts
const getPostLoginRedirect = () => {
  return '/member';
};
```

---

## Fase 3: Navegação entre Modos

### 3.1 Botão "Voltar para Membro" no Admin

Adicionar no header/sidebar do admin um botão para voltar à experiência de membro:

```tsx
// No Sidebar.tsx ou AdminLayout.tsx
<Button variant="ghost" asChild>
  <Link to="/membro">
    <ArrowLeft className="h-4 w-4 mr-2" />
    Voltar para Membro
  </Link>
</Button>
```

### 3.2 Indicador Visual de Modo

Mostrar claramente em qual modo o usuário está:
- **Modo Membro**: Header verde/azul claro, ícone de usuário
- **Modo Admin**: Header escuro, ícone de engrenagem

---

## Fase 4: Atualização dos Testes E2E

### 4.1 Testes Afetados

Todos os testes que assumem redirecionamento para `/app` após login de admin precisam ser atualizados:

```
apps/web/e2e/features/auth/login.feature
apps/web/e2e/features/financial/treasury.feature
apps/web/e2e/features/governance/councils.feature
apps/web/e2e/features/members/members-management.feature
```

### 4.2 Novo Fluxo nos Testes

**Antes:**
```gherkin
Dado que estou logado como administrador
E que estou na página de Tesouraria
```

**Depois:**
```gherkin
Dado que estou logado como administrador
E que acesso o modo administração
E que estou na página de Tesouraria
```

### 4.3 Novos Steps Necessários

```typescript
// apps/web/e2e/steps/auth.steps.ts

Given('que acesso o modo administração', async ({ page }) => {
  await page.getByRole('link', { name: /administração|admin/i }).click();
  await page.waitForURL(/\/admin/);
});

Given('que estou no modo membro', async ({ page }) => {
  await expect(page).toHaveURL(/\/member/);
});
```

### 4.4 Atualizar Steps de Login

```typescript
// apps/web/e2e/steps/auth.steps.ts

Given('que estou logado como administrador', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(testUsers.admin.email);
  await page.locator('#password').fill(testUsers.admin.password);
  await page.getByRole('button', { name: /entrar/i }).click();
  
  // Agora espera pela página de membro, não admin
  await page.waitForURL(/\/member/, { timeout: 10000 });
});
```

### 4.5 Atualizar Navegação para Páginas Admin

Todos os steps que navegam para páginas admin precisam incluir o passo de acessar o modo admin primeiro:

```typescript
// apps/web/e2e/steps/common.steps.ts

// Atualizar mapeamento de páginas
const pageRoutes: Record<string, string> = {
  // Member pages
  'Meus Dízimos': '/member/tithes',
  'Bíblia': '/member/bible',
  'Hinário': '/member/hymnal',
  'Devocionais': '/member/devotionals',
  
  // Admin pages (requerem acesso ao modo admin primeiro)
  'Tesouraria': '/admin/treasury',
  'Membros': '/admin/members',
  'Governança': '/admin/governance',
  'Configurações': '/admin/settings',
};
```

### 4.6 Lista de Features a Atualizar

| Feature File | Mudanças Necessárias |
|--------------|---------------------|
| `auth/login.feature` | Esperar `/member` após login |
| `financial/treasury.feature` | Adicionar step "acesso modo admin" |
| `financial/tithe.feature` | Atualizar rota para `/member/tithes` |
| `governance/councils.feature` | Adicionar step "acesso modo admin" |
| `members/members-management.feature` | Adicionar step "acesso modo admin" |
| `settings/church-settings.feature` | Adicionar step "acesso modo admin" |

---

## Fase 5: Ordem de Implementação

### Sprint 1: Preparação (1-2 dias)
- [ ] Criar branch `feature/member-first-flow`
- [ ] Documentar todas as rotas atuais
- [ ] Criar componente `AdminAccessCard`
- [ ] Adicionar card na `MemberHomePage`

### Sprint 2: Rotas Admin (2-3 dias)
- [ ] Renomear rotas `/app/*` para `/admin/*`
- [ ] Atualizar `App.tsx` com novas rotas
- [ ] Atualizar `Sidebar.tsx` com novos links
- [ ] Adicionar redirects de rotas antigas para novas
- [ ] Adicionar botão "Voltar para Membro"

### Sprint 3: Fluxo de Login (1 dia)
- [ ] Modificar `useAuth.ts` para redirecionar para `/membro`
- [ ] Testar fluxo completo manualmente
- [ ] Verificar que admins veem o card de acesso

### Sprint 4: Testes E2E (2-3 dias)
- [ ] Atualizar steps de login
- [ ] Criar step "que acesso o modo administração"
- [ ] Atualizar todos os cenários de admin
- [ ] Rodar suite completa e corrigir falhas

### Sprint 5: Padronização de Rotas PT-BR (1-2 dias)
- [ ] Renomear rotas admin para português
- [ ] Atualizar todos os links internos
- [ ] Atualizar testes E2E com novas rotas
- [ ] Adicionar redirects para compatibilidade

---

## Fase 6: Considerações de UX

### 6.1 Persistência de Preferência

Considerar salvar a última área acessada pelo usuário:
- Se o usuário estava no admin, ao fazer login novamente, mostrar sugestão de ir direto para admin
- Usar `localStorage` para persistir preferência

### 6.2 Atalhos de Teclado

- `Ctrl+Shift+A` - Alternar para modo Admin
- `Ctrl+Shift+M` - Alternar para modo Membro

### 6.3 Deep Links

Garantir que deep links continuem funcionando:
- `/admin/tesouraria` deve funcionar diretamente (verificar permissão)
- `/membro/biblia` deve funcionar para qualquer usuário logado

---

## Fase 7: Rollback Plan

Caso seja necessário reverter:

1. Manter rotas antigas funcionando com redirects por 30 dias
2. Feature flag para alternar entre fluxos:
   ```typescript
   const USE_MEMBER_FIRST_FLOW = true; // Desativar para reverter
   ```
3. Testes E2E devem passar em ambos os modos

---

## Métricas de Sucesso

- [ ] 100% dos testes E2E passando
- [ ] Tempo de acesso a recursos de membro reduzido para admins
- [ ] Zero erros 404 em rotas após migração
- [ ] Feedback positivo de usuários beta

---

## Arquivos Principais a Modificar

```
apps/web/src/
├── App.tsx                              # Rotas principais
├── components/
│   ├── Sidebar.tsx                      # Navegação admin
│   ├── MemberLayout.tsx                 # Layout membro
│   ├── AdminAccessCard.tsx              # NOVO: Card de acesso admin
│   └── AdminLayout.tsx                  # Layout admin (adicionar voltar)
├── hooks/
│   └── useAuth.ts                       # Lógica de redirecionamento
└── routes/
    └── member/
        └── MemberHomePage.tsx           # Adicionar AdminAccessCard

apps/web/e2e/
├── steps/
│   ├── auth.steps.ts                    # Atualizar login steps
│   └── common.steps.ts                  # Adicionar step de modo admin
└── features/
    ├── auth/login.feature               # Atualizar cenários
    ├── financial/treasury.feature       # Atualizar cenários
    └── ...                              # Todos os features de admin
```

---

## Estimativa Total

| Fase | Tempo Estimado |
|------|----------------|
| Preparação | 1-2 dias |
| Rotas Admin | 2-3 dias |
| Fluxo de Login | 1 dia |
| Testes E2E | 2-3 dias |
| Padronização PT-BR | 1-2 dias |
| **Total** | **7-11 dias** |

---

## Próximos Passos

1. Revisar e aprovar este plano
2. Criar branch `feature/member-first-flow`
3. Começar pela Fase 1 (Preparação)
4. Implementar incrementalmente com testes a cada fase
