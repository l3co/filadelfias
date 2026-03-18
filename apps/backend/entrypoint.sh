#!/bin/bash
set -e

echo "🚀 Iniciando Filadelfias Backend..."

if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Aguardando banco de dados..."
  python - <<'PY'
import asyncio
import os
import sys
import time
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def main():
    database_url = os.environ.get("DATABASE_URL", "")
    engine = create_async_engine(database_url, pool_pre_ping=True)
    for i in range(30):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            print("✅ Banco de dados está pronto!")
            await engine.dispose()
            return 0
        except Exception:
            print(f"   Tentativa {i+1}/30 - aguardando...")
            await asyncio.sleep(2)
    await engine.dispose()
    print("❌ Timeout aguardando banco de dados")
    return 1

raise SystemExit(asyncio.run(main()))
PY
fi

# Rodar migrations
echo "📦 Executando migrations..."
alembic upgrade head
echo "✅ Migrations verificadas!"

# Iniciar o processo principal
if [ "$#" -gt 0 ]; then
  echo "🌐 Iniciando comando customizado..."
  exec "$@"
fi

echo "🌐 Iniciando servidor Uvicorn..."
exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8080}
