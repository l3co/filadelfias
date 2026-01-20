# Variáveis de Ambiente

Este documento lista todas as variáveis de ambiente necessárias para o deploy.

> **Nota**: Em Janeiro/2026, migramos de DigitalOcean para Firebase/Google Cloud por questões de custo e simplicidade de configuração.

## Backend (API) - Cloud Run

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|-------------|
| `SECRET_KEY` | Chave secreta para JWT (use `openssl rand -hex 32`) | `a1b2c3d4e5f6...` | ✅ |
| `CORS_ORIGINS_STR` | Lista de origens permitidas (separadas por vírgula) | `https://filadelfias-6a116.web.app` | ✅ |
| `DEBUG` | Modo debug (sempre `false` em produção) | `false` | ❌ |
| `RESEND_API_KEY` | API Key do Resend para envio de emails | `re_xxxxxxxxxxxx` | ❌ |
| `EMAIL_FROM` | Email remetente para emails automáticos | `Filadélfias <noreply@filadelfias.app>` | ❌ |
| `FRONTEND_URL` | URL do frontend (para links em emails) | `https://filadelfias-6a116.web.app` | ❌ |

### Variáveis para Desenvolvimento Local (Docker)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `FIRESTORE_EMULATOR_HOST` | Host do emulador Firestore | `firebase:8080` |

## Frontend (Web)

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|-------------|
| `VITE_API_URL` | URL da API backend | `https://api.filadelfias.app` | ✅ |

## GitHub Actions Secrets

Configure os seguintes secrets no repositório GitHub:

| Secret | Descrição |
|--------|-----------|
| `GCP_SA_KEY` | JSON da Service Account do Firebase/GCP |
| `FIREBASE_SERVICE_ACCOUNT` | JSON da Service Account (para deploy do frontend) |

## GitHub Actions Variables

Configure as seguintes variáveis no repositório GitHub:

| Variable | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL da API para build do frontend | `https://filadelfias-api-332378056596.southamerica-east1.run.app` |

## Cloud Run - Variáveis de Ambiente

As variáveis são configuradas diretamente no Cloud Run via Console ou CLI:

```bash
gcloud run services update filadelfias-api \
  --set-env-vars="SECRET_KEY=sua-chave-secreta" \
  --set-env-vars="CORS_ORIGINS_STR=https://filadelfias-6a116.web.app" \
  --set-env-vars="DEBUG=false" \
  --region=southamerica-east1 \
  --project=filadelfias-6a116
```

## URLs de Produção

| Serviço | URL |
|---------|-----|
| Frontend (Firebase Hosting) | https://filadelfias-6a116.web.app |
| Backend (Cloud Run) | https://filadelfias-api-332378056596.southamerica-east1.run.app |

## Gerando Chaves Seguras

```bash
# Gerar SECRET_KEY
openssl rand -hex 32

# Gerar RESEND_API_KEY
# Acesse https://resend.com/api-keys
```
