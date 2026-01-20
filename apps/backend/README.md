# Filadelfias API - Backend

FastAPI backend para a plataforma Filadelfias.

## Setup Local

### Pré-requisitos
- Python 3.11+
- Poetry
- Docker (para PostgreSQL)

### Instalação

```bash
# Instalar dependências
poetry install

# Copiar arquivo de ambiente
cp .env.example .env

# Subir banco de dados
docker-compose up -d db

# Aplicar migrações
poetry run alembic upgrade head

# Rodar servidor
poetry run uvicorn src.main:app --reload
```

## Estrutura do Projeto

```
src/
├── api/           # Routers FastAPI (Controllers)
├── application/   # Use Cases (Orquestração)
├── domain/        # Entidades e Regras de Negócio
├── infra/         # Repositories e Adapters
├── config.py      # Configurações
└── main.py        # Entry Point
```

## Comandos Úteis

```bash
# Rodar testes
poetry run pytest

# Cobertura de testes
poetry run pytest --cov=src

# Formatar código
poetry run black src/

# Lint
poetry run ruff check src/

# Criar migração
poetry run alembic revision --autogenerate -m "description"

# Aplicar migrações
poetry run alembic upgrade head

# Popular dados de teste (E2E)
poetry run seed-e2e
```

## API Documentation

Acesse `http://localhost:8000/docs` para ver a documentação interativa (Swagger).
