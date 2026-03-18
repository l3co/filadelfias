# Fase 2: Fundacao do Backend com PostgreSQL Assincrono

## Objetivo

Criar a base tecnica correta para o backend deixar de ser Firestore-first e passar a ser PostgreSQL-first. Esta fase nao e sobre migrar todos os modulos; e sobre colocar a infraestrutura certa para que os modulos possam ser migrados sem gambiarra.

## O que sera introduzido

### Dependencias reais

Adicionar ao backend:

- `sqlalchemy` 2.x
- `asyncpg`
- `alembic`
- opcionalmente `greenlet` se necessario por dependencia indireta

Remover depois:

- `firebase-admin`
- dependencias transitivas ligadas a `google-cloud-firestore`

### Infraestrutura de banco

Criar componentes para:

- engine assíncrona
- session factory assíncrona
- dependency de sessao no FastAPI
- base declarativa ORM
- conventions para nomes de constraints e indices
- utilitarios para transacao e lifecycle de sessao

## Estrutura sugerida de arquivos

Uma estrutura minima adequada seria algo como:

- `apps/backend/src/infra/db/base.py`
- `apps/backend/src/infra/db/session.py`
- `apps/backend/src/infra/db/models/`
- `apps/backend/src/infra/db/repositories/`
- `apps/backend/alembic.ini`
- `apps/backend/alembic/`

O nome exato pode variar, mas a separacao precisa existir.

## Definicoes tecnicas

### Sessao por request

Cada request HTTP deve abrir sua propria `AsyncSession` e fecha-la no final. Isso evita:

- vazamento de conexao
- acoplamento entre handlers
- repositorios com estado oculto

### Configuracao

[config.py](/Users/leco/Documents/filadelfias/apps/backend/src/config.py) ja possui `DATABASE_URL`, mas ela hoje e residual. A fase precisa transformar isso em configuracao de verdade, incluindo:

- validacao da URL
- suporte a ambientes local/test/homolog/prod
- valores derivados como pool sizing e debug SQL, se necessario

### Migrations

Alembic precisa ser configurado desde o inicio.

O erro atual e existir um `entrypoint.sh` que cita Alembic e SQLAlchemy sem que essa stack esteja realmente instalada e integrada. Isso precisa ser corrigido de forma definitiva.

## O que sera removido nesta fase

Ainda nao e o momento de apagar todos os modulos Firestore, mas esta fase deve:

- isolar `firebase.py` como legado
- parar de expandir qualquer funcionalidade em cima dele
- preparar repositorios equivalentes relacionais

Se houver implementacao parcial antiga de Postgres, ela deve ser reaproveitada so se estiver correta. Caso contrario, deve ser descartada.

## Entregaveis

- `pyproject.toml` com stack real de banco
- base de sessao assíncrona funcional
- migration inicial aplicavel do zero
- backend subindo com PostgreSQL local
- healthcheck capaz de validar conectividade com o banco

## Checklist detalhado

### Infra de codigo

- adicionar dependencias
- criar engine assíncrona
- criar `AsyncSession`
- criar dependency do FastAPI
- criar base ORM
- criar metadata naming convention

### Infra de runtime

- revisar `entrypoint.sh`
- garantir `alembic upgrade head`
- garantir que o container do backend saiba subir sem GCP
- garantir que o `docker-compose` futuro possa plugar um Postgres real

### Infra de desenvolvimento

- criar primeira migration
- aplicar migration em banco vazio
- validar rollback e reapply

## Criterio de saida da fase

Esta fase so termina quando o backend puder:

- iniciar sem Firebase
- conectar em PostgreSQL
- aplicar migrations
- responder `health`
- servir como base para a migracao dos modulos de negocio
