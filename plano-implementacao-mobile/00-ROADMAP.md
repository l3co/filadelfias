# 📱 Filadélfias Mobile - Roadmap de Implementação

## Visão Geral

Construção do aplicativo mobile React Native baseado na versão web existente, mantendo a mesma experiência premium e funcionalidades, com adição de suporte offline para Bíblia, Hinário e Manual.

---

## 🎯 Objetivos

1. **Paridade com Web**: Todas as funcionalidades da versão web disponíveis no mobile
2. **Offline First**: Bíblia, Hinário e Manual disponíveis sem conexão
3. **Design Premium**: Mesmo padrão visual moderno e elegante da web
4. **Performance**: App rápido, fluido e responsivo
5. **Multi-plataforma**: iOS e Android com código compartilhado

---

## 📊 Estrutura de Arquivos do Plano

```
plano-implementacao-mobile/
├── 00-ROADMAP.md              ← Este arquivo (índice principal)
├── 01-SETUP-PROJETO.md        ← Configuração inicial do projeto
├── 02-ARQUITETURA.md          ← Estrutura de pastas e padrões
├── 03-DESIGN-SYSTEM.md        ← Componentes UI e tema
├── 04-FASE1-PUBLICO.md        ← Área pública (Bíblia, Hinário, Manual)
├── 05-FASE2-AUTH.md           ← Autenticação e onboarding
├── 06-FASE3-MEMBRO.md         ← Portal do membro
├── 07-FASE4-ADMIN.md          ← Área administrativa
├── 08-FASE5-OFFLINE.md        ← Download e sincronização offline
├── 09-FASE6-NOTIFICACOES.md   ← Push notifications
├── 10-FASE7-TESTES.md         ← Testes e QA
├── 11-FASE8-DEPLOY.md         ← Build e publicação nas lojas
└── 12-API-MAPPING.md          ← Mapeamento de endpoints
```

---

## 🗓️ Timeline Estimada

| Fase | Descrição | Duração | Dependências |
|------|-----------|---------|--------------|
| **1** | Setup + Design System | 1 semana | - |
| **2** | Área Pública (Bíblia, Hinário, Manual) | 2 semanas | Fase 1 |
| **3** | Autenticação | 1 semana | Fase 1 |
| **4** | Portal do Membro | 2 semanas | Fase 3 |
| **5** | Área Administrativa | 2 semanas | Fase 3 |
| **6** | Funcionalidade Offline | 1 semana | Fase 2 |
| **7** | Push Notifications | 3 dias | Fase 4 |
| **8** | Testes e QA | 1 semana | Todas |
| **9** | Deploy nas Lojas | 1 semana | Fase 8 |

**Total Estimado: 10-12 semanas**

---

## 🏗️ Stack Tecnológica

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| **Framework** | React Native + Expo | Reutilização de conhecimento React, Expo simplifica build |
| **Navegação** | Expo Router | File-based routing, similar ao Next.js |
| **Estado** | TanStack Query + Zustand | Mesmo padrão da web |
| **UI Components** | NativeWind (TailwindCSS) | Mesmo padrão de estilos da web |
| **Formulários** | React Hook Form + Zod | Mesmo padrão da web |
| **HTTP** | Axios | Mesmo padrão da web |
| **Storage Local** | expo-sqlite + MMKV | SQLite para dados grandes, MMKV para configs |
| **Auth** | expo-secure-store | Armazenamento seguro de tokens |
| **Icons** | Lucide React Native | Mesmos ícones da web |

---

## 📱 Telas por Área

### Área Pública (Sem Login)
- [ ] Splash Screen
- [ ] Home/Welcome
- [ ] Bíblia (listagem de livros)
- [ ] Bíblia (leitura de capítulo)
- [ ] Hinário (listagem de hinos)
- [ ] Hinário (visualização de hino)
- [ ] Manual IPB (estrutura)
- [ ] Manual IPB (artigo)
- [ ] Downloads/Offline

### Autenticação
- [ ] Login
- [ ] Esqueci a senha
- [ ] Redefinir senha
- [ ] Troca de senha obrigatória

### Portal do Membro
- [ ] Dashboard Home
- [ ] Bíblia (integrada)
- [ ] Manual (integrado)
- [ ] Devocionais
- [ ] Diretório de Membros
- [ ] Eventos
- [ ] Missões
- [ ] EBD
- [ ] Pedidos de Oração
- [ ] Perfil

### Área Administrativa
- [ ] Dashboard Admin
- [ ] Gestão de Membros
- [ ] Governança (Conselhos)
- [ ] Tesouraria
- [ ] Missões
- [ ] EBD (Classes)
- [ ] Eventos
- [ ] Devocionais
- [ ] Configurações da Igreja

---

## 🔗 Referência Rápida

| Documento | Conteúdo |
|-----------|----------|
| [01-SETUP-PROJETO.md](./01-SETUP-PROJETO.md) | Comandos de criação, dependências, estrutura inicial |
| [02-ARQUITETURA.md](./02-ARQUITETURA.md) | Pastas, padrões de código, convenções |
| [03-DESIGN-SYSTEM.md](./03-DESIGN-SYSTEM.md) | Cores, tipografia, componentes base |
| [04-FASE1-PUBLICO.md](./04-FASE1-PUBLICO.md) | Implementação da área pública |
| [05-FASE2-AUTH.md](./05-FASE2-AUTH.md) | Fluxo de autenticação |
| [06-FASE3-MEMBRO.md](./06-FASE3-MEMBRO.md) | Portal do membro |
| [07-FASE4-ADMIN.md](./07-FASE4-ADMIN.md) | Área administrativa |
| [08-FASE5-OFFLINE.md](./08-FASE5-OFFLINE.md) | Download e sincronização |
| [12-API-MAPPING.md](./12-API-MAPPING.md) | Todos os endpoints necessários |

---

## ✅ Checklist de Conclusão

### Pré-requisitos
- [ ] Node.js 18+ instalado
- [ ] Expo CLI instalado
- [ ] Android Studio configurado (para Android)
- [ ] Xcode configurado (para iOS, apenas macOS)
- [ ] Conta Apple Developer (para iOS)
- [ ] Conta Google Play Console (para Android)

### Milestones
- [ ] **M1**: App rodando com área pública funcional
- [ ] **M2**: Login/logout funcionando
- [ ] **M3**: Portal do membro completo
- [ ] **M4**: Área admin completa
- [ ] **M5**: Offline funcionando
- [ ] **M6**: Publicado nas lojas

---

## 📝 Notas Importantes

1. **Reutilização de Código**: Maximizar reutilização de lógica da web (services, types, validações)
2. **API Única**: O backend permanece o mesmo, apenas o frontend é mobile
3. **Assets Offline**: Apenas versões com arquivos JSON disponíveis podem ser baixadas:
   - Bíblia: AA, ACF, NVI
   - Hinário: Novo Cântico
   - Manual: Edição 2019
4. **Autenticação**: Usar mesmo fluxo JWT da web, armazenar token em SecureStore
