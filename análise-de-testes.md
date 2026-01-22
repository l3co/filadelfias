# Análise de Cobertura de Testes - Backend Filadélfias

**Data:** Janeiro 2026  
**Escopo:** `apps/backend/`

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Testes Unitários** | 2 arquivos |
| **Testes de Integração** | 6 arquivos |
| **APIs Testadas** | 6 de 15 (~40%) |
| **Services Testados** | 0 de 6 (0%) |
| **Repositories Testados** | 1 de 7 (~14%) |
| **Lib/Utils Testados** | 1 (security) |

---

## 🏗️ Estrutura do Backend

### APIs (`src/api/`) - 15 arquivos
| Arquivo | Status | Observação |
|---------|--------|------------|
| `auth.py` | ✅ Testado | `test_auth_endpoints.py` |
| `members.py` | ✅ Testado | `test_members_endpoints.py` |
| `governance.py` | ✅ Testado | `test_governance_endpoints.py` |
| `financial.py` | ✅ Testado | `test_financial_endpoints.py` |
| `ebd.py` | ✅ Testado | `test_ebd_endpoints.py` |
| `mission.py` | ✅ Testado | `test_mission_endpoints.py` |
| `tenants.py` | ❌ Não testado | CRUD de igrejas, deleção |
| `invitations.py` | ❌ Não testado | Convites, forgot/reset password |
| `events.py` | ❌ Não testado | CRUD de eventos |
| `devotionals.py` | ❌ Não testado | CRUD de devocionais |
| `prayer.py` | ❌ Não testado | Pedidos de oração |
| `bible.py` | ❌ Não testado | Consulta bíblica |
| `hymnal.py` | ❌ Não testado | Hinário |
| `manual.py` | ❌ Não testado | Manual Presbiteriano |
| `churches.py` | ❌ Não testado | Listagem de igrejas |

### Services (`src/services/`) - 6 arquivos
| Arquivo | Status | Criticidade |
|---------|--------|-------------|
| `email_service.py` | ❌ Não testado | **Alta** - Envio de emails |
| `bible_service.py` | ❌ Não testado | Média - Consulta bíblica |
| `manual_service.py` | ❌ Não testado | Média - Manual Presbiteriano |
| `deletion_service.py` | ❌ Não testado | **Alta** - LGPD, deleção de dados |
| `logging_service.py` | ❌ Não testado | Baixa |
| `hymnal_service.py` | ❌ Não testado | Baixa |

### Repositories (`src/infra/repositories/`) - 7 arquivos
| Arquivo | Status | Observação |
|---------|--------|------------|
| `user_repository.py` | ⚠️ Parcial | Apenas estrutura testada |
| `member_repository.py` | ❌ Não testado | |
| `membership_repository.py` | ❌ Não testado | |
| `tenant_repository.py` | ❌ Não testado | |
| `ebd_repository.py` | ❌ Não testado | |
| `financial_repository.py` | ❌ Não testado | |
| `governance_repository.py` | ❌ Não testado | |

### Lib/Utils (`src/lib/`) - 1 arquivo
| Arquivo | Status | Observação |
|---------|--------|------------|
| `permissions.py` | ❌ Não testado | **Alta criticidade** - RBAC |

### Middleware (`src/middleware/`) - 2 arquivos
| Arquivo | Status | Observação |
|---------|--------|------------|
| `permissions.py` | ❌ Não testado | Verificação de permissões |
| `logging_middleware.py` | ❌ Não testado | |

### Modules (`src/modules/`) - 7 módulos
| Módulo | Status |
|--------|--------|
| `devotionals/` | ❌ Não testado |
| `ebd/` | ❌ Não testado (apenas via integração) |
| `events/` | ❌ Não testado |
| `financial/` | ❌ Não testado (apenas via integração) |
| `governance/` | ❌ Não testado (apenas via integração) |
| `missions/` | ❌ Não testado (apenas via integração) |
| `prayer/` | ❌ Não testado |

---

## 🔴 Gaps Críticos

### 1. **Sistema de Permissões (RBAC) - Prioridade Alta**
O arquivo `src/lib/permissions.py` implementa todo o sistema de RBAC baseado no Manual Presbiteriano, incluindo:
- Permissões por ofício eclesiástico (Pastor, Presbítero, Diácono, Membro)
- Permissões por função (Tesoureiro, Secretário, Evangelista, Missionário)
- Permissões por role do sistema (Admin, Moderator, Attendee)

**Risco:** Bugs neste módulo podem causar acesso indevido a dados sensíveis.

**Testes necessários:**
```python
# Sugestão: tests/unit/test_permissions.py
- test_pastor_has_all_permissions()
- test_presbitero_cannot_delete_members()
- test_diacono_limited_governance_access()
- test_membro_view_only_permissions()
- test_tesoureiro_financial_permissions()
- test_manage_implies_all_actions()
- test_combined_office_and_function_permissions()
```

### 2. **Deletion Service (LGPD) - Prioridade Alta**
O `deletion_service.py` é responsável pela exclusão de dados de usuários e tenants (igrejas). Conformidade com LGPD.

**Testes necessários:**
```python
# Sugestão: tests/integration/test_deletion_service.py
- test_delete_tenant_removes_all_subcollections()
- test_delete_tenant_removes_user_memberships()
- test_delete_user_unlinks_from_members()
- test_delete_user_removes_memberships()
```

### 3. **Email Service - Prioridade Alta**
Responsável por enviar emails de boas-vindas e recuperação de senha.

**Testes necessários:**
```python
# Sugestão: tests/unit/test_email_service.py (com mock do Resend)
- test_is_configured_with_api_key()
- test_is_configured_without_api_key()
- test_send_welcome_email_success()
- test_send_welcome_email_not_configured()
- test_send_password_reset_email_success()
```

### 4. **Invitations API - Prioridade Alta**
Fluxo de convite de membros e recuperação de senha não testados.

**Testes necessários:**
```python
# Sugestão: tests/integration/test_invitations_endpoints.py
- test_invite_member_creates_user()
- test_invite_member_sends_email()
- test_invite_member_already_has_account()
- test_forgot_password_existing_user()
- test_forgot_password_nonexistent_user_no_leak()
- test_reset_password_valid_token()
- test_reset_password_expired_token()
- test_change_password_wrong_current()
```

### 5. **Tenants API - Prioridade Média**
CRUD de igrejas, incluindo deleção (crítico).

**Testes necessários:**
```python
# Sugestão: tests/integration/test_tenants_endpoints.py
- test_create_tenant_success()
- test_create_tenant_duplicate_slug()
- test_update_tenant_as_admin()
- test_update_tenant_non_admin_forbidden()
- test_delete_tenant_as_admin()
- test_delete_tenant_non_admin_forbidden()
```

---

## 🟡 Gaps Médios

### 6. **Novos Endpoints sem Testes**
| Endpoint | Arquivo | Testes Necessários |
|----------|---------|-------------------|
| `/events/*` | `events.py` | CRUD completo |
| `/devotionals/*` | `devotionals.py` | CRUD + get_today |
| `/prayer/*` | `prayer.py` | Create, list, pray, delete |
| `/bible/*` | `bible.py` | Get books, get chapter |
| `/manual/*` | `manual.py` | Structure, article, search |

### 7. **Bible Service**
Lógica complexa de navegação entre capítulos e integração com API externa.

```python
# Sugestão: tests/unit/test_bible_service.py
- test_get_books_returns_all_66()
- test_get_chapter_valid()
- test_get_chapter_invalid_book()
- test_get_chapter_invalid_number()
- test_chapter_navigation_first_chapter()
- test_chapter_navigation_last_chapter()
- test_remote_version_fallback()
```

### 8. **Manual Service**
Busca e navegação no Manual Presbiteriano.

```python
# Sugestão: tests/unit/test_manual_service.py
- test_get_structure_returns_parts()
- test_get_article_by_id()
- test_get_article_navigation()
- test_search_articles()
- test_search_articles_empty_query()
```

---

## 🟢 Melhorias Estruturais

### 1. **Configurar Coverage Report**
Adicionar ao `pytest.ini`:
```ini
addopts = 
    --strict-markers
    --tb=short
    --disable-warnings
    -v
    --cov=src
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=60
```

Adicionar ao `pyproject.toml`:
```toml
[tool.coverage.run]
source = ["src"]
omit = ["src/scripts/*", "src/assets/*"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if __name__ == .__main__.:",
]
```

### 2. **Fixtures Compartilhadas**
Criar fixtures reutilizáveis em `conftest.py`:
```python
@pytest.fixture
async def authenticated_user(client):
    """Retorna um usuário autenticado com token."""
    ...

@pytest.fixture
async def tenant_with_admin(client, authenticated_user):
    """Retorna um tenant com o usuário como admin."""
    ...

@pytest.fixture
async def member_in_tenant(client, tenant_with_admin):
    """Retorna um membro dentro do tenant."""
    ...
```

### 3. **Separar Testes por Tipo**
```
tests/
├── unit/
│   ├── test_security.py        ✅
│   ├── test_permissions.py     🆕
│   ├── test_email_service.py   🆕
│   ├── test_bible_service.py   🆕
│   └── test_manual_service.py  🆕
├── integration/
│   ├── test_auth_endpoints.py  ✅
│   ├── test_tenants_endpoints.py       🆕
│   ├── test_invitations_endpoints.py   🆕
│   ├── test_events_endpoints.py        🆕
│   ├── test_devotionals_endpoints.py   🆕
│   ├── test_prayer_endpoints.py        🆕
│   └── ...
└── e2e/
    └── (futuros testes end-to-end)
```

### 4. **Adicionar Testes de Edge Cases**
Para cada endpoint testado, adicionar:
- Testes de validação de input (campos obrigatórios, formatos)
- Testes de autorização (403 Forbidden)
- Testes de recursos não encontrados (404)
- Testes de concorrência (quando aplicável)

---

## 📋 Plano de Ação Sugerido

### Fase 1 - Crítico (1-2 semanas)
1. [ ] Criar `tests/unit/test_permissions.py`
2. [ ] Criar `tests/integration/test_invitations_endpoints.py`
3. [ ] Criar `tests/integration/test_deletion_service.py`
4. [ ] Configurar coverage report

### Fase 2 - Importante (2-3 semanas)
5. [ ] Criar `tests/unit/test_email_service.py`
6. [ ] Criar `tests/integration/test_tenants_endpoints.py`
7. [ ] Criar `tests/integration/test_events_endpoints.py`
8. [ ] Criar `tests/integration/test_devotionals_endpoints.py`

### Fase 3 - Complementar (3-4 semanas)
9. [ ] Criar `tests/integration/test_prayer_endpoints.py`
10. [ ] Criar `tests/unit/test_bible_service.py`
11. [ ] Criar `tests/unit/test_manual_service.py`
12. [ ] Adicionar edge cases aos testes existentes

---

## 📈 Meta de Cobertura

| Prazo | Meta |
|-------|------|
| Fase 1 | 40% → 55% |
| Fase 2 | 55% → 70% |
| Fase 3 | 70% → 80% |

---

## 🔧 Comandos Úteis

```bash
# Rodar todos os testes
pytest

# Rodar apenas testes unitários
pytest tests/unit -m unit

# Rodar apenas testes de integração
pytest tests/integration -m integration

# Rodar com coverage
pytest --cov=src --cov-report=html

# Rodar teste específico
pytest tests/unit/test_permissions.py -v
```

---

*Documento gerado automaticamente. Revisar e atualizar conforme evolução do projeto.*
