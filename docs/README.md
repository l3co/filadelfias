# Índice da Documentação — Filadelfias

Bem-vindo à documentação técnica do projeto **Filadelfias** - plataforma multi-tenant para gestão de igrejas presbiterianas.

---

## � Início Rápido

Se você é novo no projeto, comece por aqui:

1. **[README Principal](../README.md)** - Visão geral e Quick Start
2. **[Guia de Contribuição](contributing.md)** - Setup do ambiente local
3. **[Arquitetura](architecture.md)** - Entenda a estrutura do sistema
4. **[Glossário](glossary.md)** - Termos do domínio eclesiástico

---

## 📚 Documentos por Categoria

### 🏗️ Arquitetura e Design

| Documento | Descrição |
|-----------|-----------|
| [Arquitetura do Sistema](architecture.md) | Clean Architecture, diagramas, princípios |
| [Módulos do Sistema](modules.md) | Endpoints e responsabilidades de cada módulo |
| [Modelo de Dados](entity-relationship.md) | Estrutura do banco PostgreSQL |
| [Stack Tecnológica](tech-stack.md) | Tecnologias utilizadas (versões atualizadas) |

### ☁️ Infraestrutura

| Documento | Descrição |
|-----------|-----------|
| [Homelab](infrastructure/homelab.md) | Configuração do K3s, Cloudflare, GitOps |
| [Kubernetes](infrastructure/kubernetes.md) | Manifestos, deployments, troubleshooting |
| [CI/CD](infrastructure/ci-cd.md) | GitHub Actions, Fleet, pipeline de deploy |

### 👨‍💻 Desenvolvimento

| Documento | Descrição |
|-----------|-----------|
| [Guia de Contribuição](contributing.md) | Setup local, convenções, Git flow |
| [Variáveis de Ambiente](ENVIRONMENT_VARIABLES.md) | Configurações necessárias |
| [Backend README](../apps/backend/README.md) | Setup e estrutura do backend |
| [Web README](../apps/web/README.md) | Setup e estrutura do frontend web |
| [Mobile README](../apps/mobile/README.md) | Setup e estrutura do app mobile |

### � Referência

| Documento | Descrição |
|-----------|-----------|
| [Glossário](glossary.md) | Termos eclesiásticos e técnicos |
| [Bugs e Features](bug_e_features.md) | Registro de bugs conhecidos e features planejadas |

### 🎨 UX/UI

| Documento | Descrição |
|-----------|-----------|
| [UX Settings](ux-settings.md) | Paleta de cores e princípios visuais |
| [UX Plan Web](ux-plan-web.md) | Planejamento de UX para web |
| [UX Plan Mobile](ux-plan-mobile.md) | Planejamento de UX para mobile |

### 📋 Planejamento

| Documento | Descrição |
|-----------|-----------|
| [Planos por Fase](../plans/phases/) | Implementação incremental do projeto |
| [Features Planejadas](../plans/features/) | Novas funcionalidades em roadmap |
| [Débitos Técnicos](../plans/technical-debt/) | Refatorações e melhorias necessárias |
| [Retrospectivas](../plans/retrospectives/) | Análises e aprendizados |

---

## 🔗 Links Úteis

### Produção

| Serviço | URL |
|---------|-----|
| **Web App** | https://filadelfias.com |
| **API** | https://api.filadelfias.com |
| **API Docs** | https://api.filadelfias.com/docs |

### Desenvolvimento Local

| Serviço | URL |
|---------|-----|
| **Web App** | http://localhost:5173 |
| **API** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |
| **PostgreSQL** | localhost:5432 |

---

## 🏛️ Arquitetura em 1 Minuto

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTES                              │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Web (React)   │  Mobile (Expo)  │     Admin (Web)         │
└────────┬────────┴────────┬────────┴────────────┬────────────┘
         │                 │                      │
         └─────────────────┼──────────────────────┘
                           │ HTTPS/JSON (Cloudflare)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  HOMELAB K3S CLUSTER                         │
│                    BACKEND (FastAPI)                         │
│  Clean Architecture: API → Application → Domain → Infra     │
└─────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │  Local Storage  │ │   Bible API     │
│   (Database)    │ │    (Future)     │ │   (External)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 🔐 Sistema de Permissões

O backend define permissões por **ofício eclesiástico**:

| Ofício | Descrição |
|--------|-----------|
| **Pastor** | Todas as permissões do sistema |
| **Presbítero** | Gestão de membros, assembleias, votações |
| **Diácono** | Gestão financeira, assistência social |
| **Membro** | Visualização, pedidos de oração, dízimos próprios |

Os enums são centralizados no backend e consumidos via `GET /metadata`.

---

## 🆘 Precisa de Ajuda?

1. **Termos desconhecidos?** → [Glossário](glossary.md)
2. **Como funciona o sistema?** → [Arquitetura](architecture.md)
3. **Configurar ambiente?** → [Guia de Contribuição](contributing.md)
4. **Dúvidas técnicas?** → Abra uma issue no GitHub

---

**Última atualização:** Março/2026
