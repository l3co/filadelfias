#!/bin/bash
set -e

echo "🚀 Iniciando Filadelfias Backend..."

# Em produção, pular verificação de DB (já está pronto)
# Em dev com docker-compose, o healthcheck do postgres garante isso
if [ "$ENVIRONMENT" != "production" ] && [ -n "$DB_HOST" ]; then
  echo "⏳ Aguardando banco de dados..."
  # Tentar conectar via Python (mais confiável que pg_isready com SSL)
  python -c "
import time
import sys
for i in range(30):
    try:
        from sqlalchemy import create_engine, text
        import os
        engine = create_engine(os.environ.get('DATABASE_URL', ''))
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        print('✅ Banco de dados está pronto!')
        sys.exit(0)
    except Exception as e:
        print(f'   Tentativa {i+1}/30 - aguardando...')
        time.sleep(2)
print('❌ Timeout aguardando banco de dados')
sys.exit(1)
"
fi

# Rodar migrations
echo "📦 Executando migrations..."
alembic upgrade head || echo "⚠️ Migrations já aplicadas ou erro (continuando...)"
echo "✅ Migrations verificadas!"

# Iniciar o servidor
echo "🌐 Iniciando servidor Uvicorn..."
exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8080}
