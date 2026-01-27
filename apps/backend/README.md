# Filadelfias API - Backend

API REST para a plataforma Filadelfias, construída com **FastAPI** e **Firestore**.

## 🚀 Setup Local

### Pré-requisitos

- Python 3.11+
- Poetry 1.8+
- Docker (para Firestore Emulator)
- Credenciais Firebase (para produção)

### Instalação

```bash
# Instalar dependências
poetry install

# Copiar arquivo de ambiente
cp .env.example .env
# Edite .env com suas configurações
```

### Rodando com Firestore Emulator (Recomendado para dev)

```bash
# 1. Inicie o emulador
docker run -d -p 8080:8080 mtlynch/firestore-emulator

# 2. Rode o servidor
FIRESTORE_EMULATOR_HOST=localhost:8080 PROJECT_ID=filadelfias-dev poetry run uvicorn src.main:app --reload
```

### Rodando com Firebase Real

```bash
# Configure as credenciais
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
export PROJECT_ID=filadelfias-6a116

# Rode o servidor
poetry run uvicorn src.main:app --reload
```

---

## 📁 Estrutura do Projeto

```
src/
├── api/              # Routers FastAPI (Controllers)
│   ├── auth.py       # Autenticação (login, registro)
│   ├── members.py    # Gestão de membros
│   ├── metadata.py   # Enums e labels centralizados
│   └── ...
├── application/      # Use Cases (Orquestração)
├── domain/           # Entidades e Regras de Negócio
│   ├── enums.py      # EcclesiasticalOffice, MemberStatus, etc.
│   └── labels.py     # Labels pt-BR para enums
├── infra/            # Repositories (Firestore)
│   ├── firestore/    # Implementações Firestore
│   └── repositories/ # Interfaces
├── lib/              # Utilitários
│   └── permissions.py # RBAC por ofício eclesiástico
├── modules/          # Módulos de domínio
│   ├── prayer/       # Pedidos de oração
│   ├── tithe/        # Dízimos e ofertas
│   ├── ebd/          # Escola Bíblica Dominical
│   ├── missions/     # Missionários
│   ├── events/       # Eventos
│   └── devotionals/  # Devocionais
├── services/         # Serviços externos
│   ├── bible.py      # API A Bíblia Digital
│   └── hymnal.py     # Hinário Novo Cântico
├── scripts/          # Scripts utilitários
│   ├── seed_dev_data.py  # Popular dados de desenvolvimento
│   └── seed_e2e_data.py  # Popular dados para testes E2E
├── config.py         # Configurações (Pydantic Settings)
└── main.py           # Entry Point FastAPI
```

---

## 🔐 Sistema de Permissões (RBAC)

O backend define permissões por **ofício eclesiástico**:

```python
# src/lib/permissions.py
OFFICE_PERMISSIONS = {
    "PASTOR": { "members:*", "tithe:*", "prayer:*", ... },
    "PRESBITERO": { "members:read", "assembly:*", ... },
    "DIACONO": { "tithe:*", "expense:*", ... },
    "MEMBRO": { "prayer:create", "tithe:create", ... },
}
```

### Endpoint de Metadados

`GET /metadata` retorna todos os enums com labels para consumo no frontend:

```json
{
  "enums": {
    "ecclesiastical_offices": [
      { "value": "PASTOR", "label": "Pastor" },
      { "value": "PRESBITERO", "label": "Presbítero" },
      ...
    ],
    "member_statuses": [...],
    "genders": [...]
  }
}
```

---

## 🧪 Comandos Úteis

```bash
# Rodar testes
poetry run pytest

# Cobertura de testes
poetry run pytest --cov=src

# Formatar código
poetry run black src/

# Lint
poetry run ruff check src/

# Popular dados de desenvolvimento
poetry run python -m src.scripts.seed_dev_data

# Popular dados para E2E
poetry run seed-e2e
```

---

## 📡 Principais Endpoints

| Módulo | Endpoint | Descrição |
|--------|----------|-----------|
| **Auth** | `POST /auth/login` | Login com email/senha |
| **Auth** | `POST /auth/register` | Registro de novo usuário |
| **Auth** | `GET /auth/me` | Dados do usuário logado |
| **Metadata** | `GET /metadata` | Enums e labels do sistema |
| **Members** | `GET /tenants/{id}/members` | Diretório de membros |
| **Prayer** | `GET /prayer/requests` | Pedidos de oração |
| **Prayer** | `POST /prayer/requests` | Criar pedido |
| **Tithe** | `GET /tithe/my-records` | Meus dízimos |
| **Tithe** | `POST /tithe/submit` | Registrar dízimo |
| **Bible** | `GET /bible/{book}/{chapter}` | Capítulo da Bíblia |
| **Hymnal** | `GET /hymnal/songs` | Lista de hinos |

---

## 🌐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PROJECT_ID` | ID do projeto Firebase | `filadelfias-6a116` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Caminho para service account | `/path/to/creds.json` |
| `FIRESTORE_EMULATOR_HOST` | Host do emulador (dev) | `localhost:8080` |
| `JWT_SECRET_KEY` | Chave secreta para JWT | `sua-chave-secreta` |
| `JWT_ALGORITHM` | Algoritmo JWT | `HS256` |
| `BIBLE_API_TOKEN` | Token da API A Bíblia Digital | `token` |

---

## 📚 Documentação da API

- **Local**: http://localhost:8000/docs (Swagger UI)
- **Produção**: https://filadelfias-api-332378056596.southamerica-east1.run.app/docs

---

## 🐳 Deploy

O backend é deployado automaticamente via GitHub Actions para **Google Cloud Run**:

1. Push para `main` dispara o workflow
2. Build da imagem Docker
3. Push para Container Registry
4. Deploy no Cloud Run (auto-scaling)

Veja `.github/workflows/` para detalhes.
