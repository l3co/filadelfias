# Análise de Segurança e Plano de Implementação

## Resumo Executivo

Esta análise avalia a segurança do backend (FastAPI/Python) e frontend (React/TypeScript) da plataforma Filadélfias, identificando vulnerabilidades e propondo correções baseadas no OWASP Top 10.

---

## 🔴 Vulnerabilidades Críticas

### 1. Secret Key Hardcoded no Código

**Arquivo:** `apps/backend/src/config.py:40`

```python
secret_key: str = "your-secret-key-change-in-production"
```

**Risco:** CRÍTICO - Se este valor default for usado em produção, qualquer pessoa pode forjar tokens JWT válidos.

**Correção:**
```python
# config.py
from pydantic import field_validator

class Settings(BaseSettings):
    secret_key: str  # SEM VALOR DEFAULT - Obrigatório via env

    @field_validator("secret_key", mode="before")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or v == "your-secret-key-change-in-production":
            raise ValueError("SECRET_KEY deve ser definido em produção! Use: openssl rand -hex 32")
        if len(v) < 32:
            raise ValueError("SECRET_KEY deve ter pelo menos 32 caracteres")
        return v
```

**Verificação de produção:**
```bash
# Gerar chave segura
openssl rand -hex 32
```

---

### 2. Token JWT Armazenado em localStorage

**Arquivo:** `apps/web/src/lib/api.ts:41`

```typescript
const token = localStorage.getItem('access_token');
```

**Risco:** ALTO - Vulnerável a ataques XSS. Se um script malicioso for injetado, pode roubar o token.

**Correção Recomendada:**

**Opção A: HttpOnly Cookie (Mais Seguro)**
```python
# Backend - auth.py
from fastapi import Response

@router.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    # ... validação ...
    access_token = create_access_token(data={"sub": user["id"]})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Apenas HTTPS
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60
    )
    return {"message": "Login successful"}
```

```typescript
// Frontend - api.ts
export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,  // Envia cookies automaticamente
});
```

**Opção B: Manter localStorage com proteções adicionais (Mais simples)**
- Implementar Content Security Policy (CSP)
- Sanitizar todas as entradas do usuário
- Reduzir tempo de expiração do token

---

### 3. Sem Rate Limiting

**Risco:** ALTO - Endpoints de login/registro vulneráveis a:
- Ataques de força bruta
- Credential stuffing
- DoS

**Correção:**
```python
# main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# auth.py
from slowapi import limiter

@router.post("/login")
@limiter.limit("5/minute")  # Máximo 5 tentativas por minuto
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    ...

@router.post("/register")
@limiter.limit("3/minute")  # Máximo 3 registros por minuto
async def register(request: Request, user_data: UserCreate):
    ...

@router.post("/auth/forgot-password")
@limiter.limit("3/hour")  # Máximo 3 por hora
async def forgot_password(request: Request, data: ForgotPasswordRequest):
    ...
```

**Dependência:**
```bash
poetry add slowapi
```

---

## 🟠 Vulnerabilidades Médias

### 4. Sem Validação de Força de Senha

**Arquivo:** `apps/backend/src/domain/schemas.py:64`

```python
password: str = Field(..., min_length=8, max_length=100)
```

**Risco:** MÉDIO - Aceita senhas fracas como "12345678"

**Correção:**
```python
# domain/schemas.py
import re
from pydantic import field_validator

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Senha deve ter pelo menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Senha deve conter pelo menos uma letra maiúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("Senha deve conter pelo menos uma letra minúscula")
        if not re.search(r"\d", v):
            raise ValueError("Senha deve conter pelo menos um número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Senha deve conter pelo menos um caractere especial")
        return v
```

---

### 5. CORS Muito Permissivo em Produção

**Arquivo:** `apps/backend/src/main.py:36-42`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],  # ⚠️ Muito permissivo
    allow_headers=["*"],  # ⚠️ Muito permissivo
)
```

**Correção:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
    max_age=600,  # Cache preflight por 10 min
)
```

---

### 6. Senha Temporária Retornada na API Response

**Arquivo:** `apps/backend/src/api/invitations.py:117-122`

```python
return InviteResponse(
    success=True,
    message=f"Convite enviado para {member['email']}",
    temporary_password=temp_password,  # ⚠️ Expõe senha na response
    email_sent=email_sent,
)
```

**Risco:** MÉDIO - A senha temporária fica visível no histórico de rede do navegador e logs.

**Correção:**
```python
return InviteResponse(
    success=True,
    message=f"Convite enviado para {member['email']}",
    temporary_password=temp_password if not email_sent else None,  # Só mostra se email falhou
    email_sent=email_sent,
)
```

---

### 7. Logs Podem Conter Dados Sensíveis

**Verificar:** `apps/backend/src/services/email_service.py:106`

```python
print(f"[EMAIL] Welcome email sent to {to_email}: {response}")
```

**Correção:**
```python
# Usar logging estruturado sem dados sensíveis
from src.services.logging_service import log_info

log_info("Welcome email sent", email_masked=f"{to_email[:3]}***@***")
```

---

### 8. Sem Content Security Policy (CSP)

**Risco:** MÉDIO - Sem CSP, ataques XSS são mais fáceis.

**Correção (Frontend - index.html ou meta tag):**
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.filadelfias.com https://*.firebaseio.com;
">
```

---

## 🟡 Vulnerabilidades Baixas / Melhorias

### 9. Tempo de Expiração do Token

**Arquivo:** `apps/backend/src/config.py:42`

```python
access_token_expire_minutes: int = 30
```

**Recomendação:** 
- Access Token: 15-30 minutos ✅ (atual está ok)
- Implementar Refresh Token para melhor UX

---

### 10. Sem Refresh Token

**Risco:** BAIXO - Usuários precisam fazer login frequentemente.

**Correção (implementar refresh token):**
```python
# Criar endpoint /auth/refresh
# Armazenar refresh token em HttpOnly cookie
# Access token curto (15 min), refresh token longo (7 dias)
```

---

### 11. Sem Proteção CSRF

**Risco:** BAIXO (se usar JWT em header) / MÉDIO (se usar cookies)

Se migrar para cookies HttpOnly, adicionar proteção CSRF:
```python
from fastapi_csrf_protect import CsrfProtect

@CsrfProtect.load_config
def get_csrf_config():
    return CsrfSettings(secret_key=settings.secret_key)
```

---

### 12. Database URL com Credenciais Default

**Arquivo:** `apps/backend/src/config.py:18`

```python
database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/filadelfias"
```

**Nota:** Isso é usado apenas se DATABASE_URL não estiver definido. Em produção, você usa Firestore, então isso é menos crítico. Mas o valor default ainda pode vazar em logs.

**Correção:**
```python
database_url: str = ""  # Sem valor default

@field_validator("database_url", mode="before")
@classmethod
def validate_database_url(cls, v: str) -> str:
    if not v and os.getenv("FIRESTORE_EMULATOR_HOST") is None:
        # Só exige em produção quando não está usando emulator
        pass
    return v or ""
```

---

## ✅ Pontos Positivos Identificados

| Aspecto | Status | Observação |
|---------|--------|------------|
| **Bcrypt para senhas** | ✅ Correto | `passlib.context.CryptContext(schemes=["bcrypt"])` |
| **JWT com algoritmo seguro** | ✅ Correto | HS256 é adequado para single-server |
| **Validação de email** | ✅ Correto | Usando `EmailStr` do Pydantic |
| **Sem SQL Injection** | ✅ N/A | Usa Firestore (NoSQL) |
| **Sem eval/exec** | ✅ Correto | Não encontrado código perigoso |
| **Sem dangerouslySetInnerHTML** | ✅ Correto | Não encontrado no frontend |
| **Password reset seguro** | ✅ Correto | Token com `secrets.token_urlsafe(32)` |
| **Não vaza existência de usuário** | ✅ Correto | `/forgot-password` retorna mesma mensagem |
| **.env no .gitignore** | ✅ Correto | Arquivo sensível ignorado |
| **RBAC implementado** | ✅ Correto | Sistema de permissões por ofício |

---

## 📋 Plano de Implementação

### Fase 1: Crítico (Fazer Imediatamente)

| # | Tarefa | Arquivo | Esforço |
|---|--------|---------|---------|
| 1 | Validar SECRET_KEY em produção | `config.py` | 30 min |
| 2 | Implementar rate limiting | `main.py`, `auth.py` | 2h |
| 3 | Revisar CORS origins em produção | `main.py` | 30 min |

### Fase 2: Alta Prioridade (Próxima Sprint)

| # | Tarefa | Arquivo | Esforço |
|---|--------|---------|---------|
| 4 | Validação de força de senha | `schemas.py` | 1h |
| 5 | Migrar token para HttpOnly cookie | `auth.py`, `api.ts` | 4h |
| 6 | Não retornar senha temporária | `invitations.py` | 30 min |
| 7 | Adicionar CSP headers | `index.html` | 1h |

### Fase 3: Média Prioridade (Próximo Mês)

| # | Tarefa | Arquivo | Esforço |
|---|--------|---------|---------|
| 8 | Implementar refresh tokens | `auth.py` | 4h |
| 9 | Sanitizar logs | `logging_service.py` | 2h |
| 10 | Adicionar CSRF protection | `main.py` | 2h |
| 11 | Implementar account lockout | `auth.py` | 2h |

---

## 🔧 Comandos Úteis

```bash
# Gerar SECRET_KEY segura
openssl rand -hex 32

# Verificar dependências com vulnerabilidades
poetry run pip-audit

# Instalar rate limiting
poetry add slowapi

# Verificar OWASP issues
poetry add bandit
poetry run bandit -r src/

# Scan de segurança no frontend
npm audit
```

---

## 📚 Referências OWASP

| OWASP Top 10 2021 | Status no Projeto |
|-------------------|-------------------|
| A01 - Broken Access Control | ⚠️ Implementado mas precisa testes |
| A02 - Cryptographic Failures | ✅ Bcrypt + JWT |
| A03 - Injection | ✅ N/A (Firestore) |
| A04 - Insecure Design | ⚠️ Rate limiting ausente |
| A05 - Security Misconfiguration | 🔴 Secret key hardcoded |
| A06 - Vulnerable Components | ⚠️ Verificar com pip-audit |
| A07 - Auth Failures | ⚠️ Sem account lockout |
| A08 - Software Integrity | ✅ OK |
| A09 - Security Logging | ⚠️ Logs podem ter dados sensíveis |
| A10 - SSRF | ✅ N/A |

---

## Checklist de Deploy Seguro

```markdown
Antes de ir para produção:

- [X] SECRET_KEY única e forte (32+ chars)
- [X] DEBUG=False
- [X] CORS_ORIGINS apenas domínios necessários
- [X] Rate limiting ativo
- [X] HTTPS obrigatório
- [X] Logs sem dados sensíveis
- [X] pip-audit sem vulnerabilidades críticas
- [X] npm audit sem vulnerabilidades críticas
- [X] Backup de banco configurado
```
