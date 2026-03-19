# Roadmap — Bíblia no PostgreSQL

Migração completa do conteúdo bíblico de JSON estático para PostgreSQL com features de busca, anotações, destaques e planos de leitura.

---

## 🎯 Visão Geral

**Problema atual:**
- Bíblias armazenadas em JSON estático (~12MB)
- Sem busca por palavra-chave
- Sem metadados (títulos de capítulos)
- Sem recursos de estudo (anotações, destaques)
- Cache duplicado por worker

**Solução:**
- Migrar para PostgreSQL com full-text search
- Adicionar anotações privadas/públicas por usuário
- Destaques com cores e categorias
- Planos de leitura bíblica
- Frontend web e mobile completo

---

## 📊 Escopo Total

### Backend
- 8 tabelas novas no PostgreSQL
- ~150k versículos migrados (3 versões)
- Repository + Service + API layers
- Busca full-text em português
- Sistema de fallback (Postgres → API → JSON)

### Frontend Web
- Leitor de Bíblia redesenhado
- Interface de busca com filtros
- Editor de anotações inline
- Sistema de destaques com cores
- Painel de planos de leitura
- Progresso visual

### Frontend Mobile
- Leitor otimizado para mobile
- Busca rápida com autocomplete
- Anotações com rich text
- Destaques por toque longo
- Sincronização offline
- Planos de leitura com notificações

---

## 🗺️ Fases de Implementação

| Fase | Título | Backend | Frontend | Duração |
|------|--------|---------|----------|---------|
| **1** | Schema PostgreSQL e Models | ✅ | - | 4-6h |
| **2** | Script de Importação | ✅ | - | 2-3h |
| **3** | Repository Layer | ✅ | - | 6-8h |
| **4** | Service Layer com Fallback | ✅ | - | 4-6h |
| **5** | API Endpoints | ✅ | - | 4-6h |
| **6** | Frontend Web | - | ✅ | 12-16h |
| **7** | Frontend Mobile | - | ✅ | 12-16h |
| **8** | Performance e Índices | ✅ | - | 3-4h |
| **9** | Testes Completos | ✅ | ✅ | 6-8h |

**Total estimado:** 53-73 horas

---

## 📋 Checklist Geral

### Backend
- [ ] Criar schema PostgreSQL
- [ ] Migration Alembic
- [ ] Importar 3 versões (NVI, ACF, AA)
- [ ] Repository layer completo
- [ ] Service com fallback strategy
- [ ] Endpoints de leitura
- [ ] Endpoints de busca
- [ ] Endpoints de anotações
- [ ] Endpoints de destaques
- [ ] Endpoints de planos de leitura
- [ ] Índices full-text
- [ ] Testes unitários
- [ ] Testes de integração

### Frontend Web
- [ ] Redesign do leitor de Bíblia
- [ ] Interface de busca
- [ ] Sistema de anotações
- [ ] Sistema de destaques
- [ ] Painel de planos de leitura
- [ ] Progresso visual
- [ ] Responsividade mobile
- [ ] Testes E2E

### Frontend Mobile
- [ ] Leitor otimizado
- [ ] Busca com autocomplete
- [ ] Anotações com rich text
- [ ] Destaques por toque
- [ ] Sincronização offline
- [ ] Planos com notificações
- [ ] Performance otimizada
- [ ] Testes E2E

---

## 🎯 Objetivos de Negócio

1. **Melhorar estudo bíblico** — Anotações e destaques facilitam aprendizado
2. **Engajamento diário** — Planos de leitura mantêm disciplina
3. **Busca eficiente** — Encontrar versículos por palavra-chave
4. **Compartilhamento** — Anotações públicas entre membros
5. **Mobilidade** — Funciona offline no mobile

---

## 📈 Métricas de Sucesso

- [ ] Todas as 3 versões importadas sem erros
- [ ] Busca full-text <200ms
- [ ] Endpoints compatíveis com código atual
- [ ] Fallback funciona se Postgres cair
- [ ] Web: tempo de carregamento <1s
- [ ] Mobile: sincronização offline funciona
- [ ] Cobertura de testes >80%
- [ ] Zero downtime no deploy

---

## 🚀 Próximos Passos

1. Ler **fase_1.md** — Schema e Models
2. Implementar migration
3. Executar e validar
4. Seguir para fase_2.md
5. Repetir até fase_9.md

---

## 📚 Documentação Relacionada

- `fase_1.md` — Schema PostgreSQL e Models
- `fase_2.md` — Script de Importação
- `fase_3.md` — Repository Layer
- `fase_4.md` — Service Layer com Fallback
- `fase_5.md` — API Endpoints
- `fase_6.md` — Frontend Web
- `fase_7.md` — Frontend Mobile
- `fase_8.md` — Performance e Índices
- `fase_9.md` — Testes

---

**Status:** 🟡 Planejamento Completo — Aguardando Implementação
