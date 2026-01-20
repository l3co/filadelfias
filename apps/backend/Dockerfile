FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar pip e poetry (versão específica para compatibilidade)
RUN pip install --no-cache-dir --upgrade pip "poetry==2.1.1"

# Copiar arquivos de dependências
COPY pyproject.toml poetry.lock* ./

# Instalar dependências Python (sem criar virtualenv no container)
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --only main --no-root

# Copiar código da aplicação
COPY src ./src
COPY alembic.ini ./
COPY alembic ./alembic
COPY entrypoint.sh ./

# Tornar o entrypoint executável
RUN chmod +x entrypoint.sh

# Expor porta (Digital Ocean usa 8080 por padrão)
EXPOSE 8080

# Usar entrypoint que roda migrations e inicia o servidor
ENTRYPOINT ["./entrypoint.sh"]
