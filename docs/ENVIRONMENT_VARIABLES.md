# Variáveis de Ambiente

Este documento lista todas as variáveis de ambiente necessárias para o deploy na Digital Ocean.

## Backend (API)

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|-------------|
| `DATABASE_URL` | URL de conexão com PostgreSQL (asyncpg) | `postgresql+asyncpg://user:pass@host:5432/db` | ✅ |
| `SECRET_KEY` | Chave secreta para JWT (use `openssl rand -hex 32`) | `a1b2c3d4e5f6...` | ✅ |
| `ALGORITHM` | Algoritmo de criptografia JWT | `HS256` | ✅ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tempo de expiração do token em minutos | `30` | ✅ |
| `CORS_ORIGINS_STR` | Lista de origens permitidas (separadas por vírgula) | `https://app.filadelfias.app,https://filadelfias.app` | ✅ |
| `DEBUG` | Modo debug (sempre `false` em produção) | `false` | ❌ |
| `RESEND_API_KEY` | API Key do Resend para envio de emails | `re_xxxxxxxxxxxx` | ❌ |
| `EMAIL_FROM` | Email remetente para emails automáticos | `Filadélfias <noreply@filadelfias.app>` | ❌ |
| `FRONTEND_URL` | URL do frontend (para links em emails) | `https://app.filadelfias.app` | ❌ |

## Frontend (Web)

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|-------------|
| `VITE_API_URL` | URL da API backend | `https://api.filadelfias.app` | ✅ |

## GitHub Actions Secrets

Configure os seguintes secrets no repositório GitHub:

| Secret | Descrição |
|--------|-----------|
| `GITHUB_TOKEN` | Automático - usado para push de imagens Docker |

## GitHub Actions Variables

Configure as seguintes variáveis no repositório GitHub:

| Variable | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL da API para build do frontend | `https://api.filadelfias.app` |

## Digital Ocean - App Platform

### Backend Service

```yaml
envs:
  - key: DATABASE_URL
    scope: RUN_TIME
    value: ${db.DATABASE_URL}
  - key: SECRET_KEY
    scope: RUN_TIME
    type: SECRET
  - key: ALGORITHM
    scope: RUN_TIME
    value: HS256
  - key: ACCESS_TOKEN_EXPIRE_MINUTES
    scope: RUN_TIME
    value: "30"
  - key: CORS_ORIGINS_STR
    scope: RUN_TIME
    value: "https://app.filadelfias.app"
  - key: DEBUG
    scope: RUN_TIME
    value: "false"
  - key: RESEND_API_KEY
    scope: RUN_TIME
    type: SECRET
  - key: EMAIL_FROM
    scope: RUN_TIME
    value: "Filadélfias <noreply@filadelfias.app>"
  - key: FRONTEND_URL
    scope: RUN_TIME
    value: "https://app.filadelfias.app"
```

### Frontend Service (Static Site)

```yaml
envs:
  - key: VITE_API_URL
    scope: BUILD_TIME
    value: "https://api.filadelfias.app"
```

## Gerando Chaves Seguras

```bash
# Gerar SECRET_KEY
openssl rand -hex 32

# Gerar RESEND_API_KEY
# Acesse https://resend.com/api-keys
```
