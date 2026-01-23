# Análise de Segurança Atualizada - Janeiro 2026

## 📋 Resumo

Esta análise complementa o documento original (`analise-de-seguranca-e-plano-de-implementacao.md`), identificando pontos adicionais de segurança não contemplados anteriormente.

---

## ✅ Pontos Já Implementados (verificados no deploy atual)

Com base nas suas marcações no checklist:

| Item | Status | Observação |
|------|--------|------------|
| SECRET_KEY única e forte | ✅ Feito | Configurado via env var |
| DEBUG=False | ✅ Feito | Desabilitado em produção |
| CORS_ORIGINS restritos | ✅ Feito | Apenas domínios autorizados |

---

## 🔴 Vulnerabilidades Críticas Ainda Pendentes

### 1. Sem Rate Limiting (Prioridade CRÍTICA)

**Status:** ❌ Não implementado  
**Risco:** CRÍTICO

O endpoint de login `/auth/login` e registro `/auth/register` não possuem rate limiting. Isso expõe a aplicação a:
- Ataques de força bruta
- Credential stuffing
- DoS (Denial of Service)

**Arquivo:** `apps/backend/src/api/auth.py`

**Implementação necessária:**
```python
# main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# auth.py
@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    ...

@router.post("/register")
@limiter.limit("3/minute")
async def register(request: Request, user_data: UserCreate):
    ...
```

**Comando:**
```bash
poetry add slowapi
```

---

## 🟠 Vulnerabilidades Médias

### 2. Token JWT em localStorage (Pendente)

**Status:** ❌ Ainda usando localStorage  
**Risco:** MÉDIO-ALTO

Arquivos que usam localStorage para token:
- `apps/web/src/lib/api.ts:41` - Lê token
- `apps/web/src/hooks/useAuth.ts:20` - Salva token
- `apps/web/src/routes/ChurchRegistrationWizard.tsx:89` - Usa chave diferente `'token'`

**Problema adicional encontrado:** Há inconsistência nas chaves usadas:
- `'access_token'` (usado na maioria)
- `'token'` (usado no ChurchRegistrationWizard)

**Correção mínima:**
1. Padronizar a chave do token
2. Adicionar CSP para mitigar XSS

---

### 3. Content Security Policy Incompleto

**Status:** ⚠️ Parcialmente implementado  
**Arquivo:** `apps/web/index.html:7`

Atualmente só tem:
```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
```

**Correção recomendada:**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.filadelfias.com https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
" />
```

---

### 4. CORS Methods Muito Permissivo

**Status:** ⚠️ Não corrigido  
**Arquivo:** `apps/backend/src/main.py:40-41`

```python
allow_methods=["*"],  # ⚠️ Muito permissivo
allow_headers=["*"],  # ⚠️ Muito permissivo
```

**Correção:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID", "X-Tenant-ID"],
    expose_headers=["X-Request-ID"],
    max_age=600,
)
```

---

### 5. Validação de Força de Senha Ausente

**Status:** ❌ Não implementado  
**Arquivo:** `apps/backend/src/domain/schemas.py:64`

Atualmente aceita qualquer senha com 8+ caracteres:
```python
password: str = Field(..., min_length=8, max_length=100)
```

**Correção necessária:** Adicionar validator conforme plano original.

---

### 6. Logs com Potenciais Dados Sensíveis

**Status:** ⚠️ Requer auditoria  

Encontrados vários `print()` statements que podem vazar dados:

| Arquivo | Linha | Conteúdo |
|---------|-------|----------|
| `email_service.py` | 106 | `print(f"[EMAIL] Welcome email sent to {to_email}...")` |
| `email_service.py` | 185 | `print(f"[EMAIL] Password reset email sent to {to_email}...")` |
| `bible_service.py` | 130, 167, 200 | Prints de debug |
| `hymnal_service.py` | 29, 31 | Prints de debug |

**Correção:** Substituir `print()` por `log_info()` ou `log_debug()` do logging_service.

---

## 🟢 Pontos Positivos Verificados

| Aspecto | Status | Observação |
|---------|--------|------------|
| **npm audit** | ✅ 0 vulnerabilidades | Frontend sem vulnerabilidades conhecidas |
| **Sem dangerouslySetInnerHTML** | ✅ Correto | Não encontrado uso inseguro |
| **Sem eval/exec** | ✅ Correto | Não encontrado no backend |
| **Logs estruturados** | ✅ Parcial | logging_service.py implementado, mas não usado em todos os lugares |
| **Bcrypt para senhas** | ✅ Correto | Usando passlib com bcrypt |
| **Secret em env var** | ✅ Correto | Configurado via variável de ambiente |

---

## 📋 Plano de Implementação Atualizado

### Fase 1: Crítico (Esta Sprint) - ~4h

| # | Tarefa | Esforço | Arquivos |
|---|--------|---------|----------|
| 1 | **Implementar Rate Limiting** | 2h | `main.py`, `auth.py`, `invitations.py` |
| 2 | Corrigir CORS methods/headers | 30min | `main.py` |
| 3 | Padronizar chave localStorage | 30min | `ChurchRegistrationWizard.tsx` |
| 4 | Adicionar CSP completo | 1h | `index.html` |

### Fase 2: Média Prioridade (Próxima Sprint) - ~6h

| # | Tarefa | Esforço | Arquivos |
|---|--------|---------|----------|
| 5 | Validação de força de senha | 1h | `schemas.py` |
| 6 | Substituir prints por logs | 2h | Vários arquivos |
| 7 | Implementar account lockout | 2h | `auth.py` |
| 8 | Não retornar senha temporária | 30min | `invitations.py` |

### Fase 3: Baixa Prioridade (Próximo Mês) - ~8h

| # | Tarefa | Esforço | Arquivos |
|---|--------|---------|----------|
| 9 | Migrar token para HttpOnly cookie | 4h | Backend + Frontend |
| 10 | Implementar refresh token | 3h | `auth.py`, `api.ts` |
| 11 | Adicionar CSRF protection (se usar cookies) | 1h | `main.py` |

---

## 🔧 Comandos Úteis

```bash
# Instalar rate limiting
cd apps/backend && poetry add slowapi

# Verificar dependências Python (instalar se necessário)
poetry add --group dev pip-audit
poetry run pip-audit

# Scan de segurança no código
poetry add --group dev bandit
poetry run bandit -r src/ -ll

# Verificar frontend
cd apps/web && npm audit
```

---

## 📊 Score de Segurança Atual

| Categoria | Peso | Score | Máximo |
|-----------|------|-------|--------|
| Autenticação | 25% | 18/25 | 25 |
| Autorização | 20% | 16/20 | 20 |
| Proteção de Dados | 20% | 15/20 | 20 |
| Infraestrutura | 15% | 13/15 | 15 |
| Logging/Monitoramento | 10% | 6/10 | 10 |
| Dependências | 10% | 9/10 | 10 |
| **Total** | **100%** | **77/100** | **100** |

**Classificação:** 🟡 **BOM** (entre 60-80)

Após implementar Fase 1: estimativa ~85/100 (Muito Bom)

---

## ✅ Checklist de Deploy Atualizado

```markdown
Antes de ir para produção:

- [X] SECRET_KEY única e forte (32+ chars)
- [X] DEBUG=False
- [X] CORS_ORIGINS apenas domínios necessários
- [ ] Rate limiting ativo (CRÍTICO - implementar agora)
- [X] HTTPS obrigatório
- [ ] CSP configurado adequadamente
- [ ] Logs sem dados sensíveis
- [X] npm audit sem vulnerabilidades críticas
- [ ] pip-audit sem vulnerabilidades críticas (instalar e executar)
- [ ] Backup de banco configurado
```
