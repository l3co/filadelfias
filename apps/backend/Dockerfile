FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ARG INSTALL_DEV=false

# Install system dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install pip and poetry
RUN pip install --no-cache-dir --upgrade pip "poetry==2.1.1"

# Copy dependency files
COPY pyproject.toml poetry.lock* alembic.ini pytest.ini ./

# Install dependencies (no virtualenv)
RUN poetry config virtualenvs.create false \
    && if [ "$INSTALL_DEV" = "true" ]; then \
        poetry install --no-interaction --no-ansi --with dev --no-root; \
    else \
        poetry install --no-interaction --no-ansi --only main --no-root; \
    fi

# Copy application code
COPY src ./src
COPY alembic ./alembic
COPY tests ./tests
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]

# Start command
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
