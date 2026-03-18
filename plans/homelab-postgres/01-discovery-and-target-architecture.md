# Fase 1: Discovery e Arquitetura Alvo

## O que existe hoje

### Backend

O backend atual e FastAPI, mas a persistencia real ainda esta baseada em Firestore:

- Inicializacao Firebase/Firestore em [firebase.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/firebase.py)
- Abstracao base em [firestore_repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/firestore_repository.py)
- Repositorios Firestore em:
  - [tenant_repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/repositories/tenant_repository.py)
  - [membership_repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/repositories/membership_repository.py)
  - [user_repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/repositories/user_repository.py)
  - [member_repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/repositories/member_repository.py)
  - [governance_repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/repositories/governance_repository.py)
  - [financial_repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/repositories/financial_repository.py)
  - [ebd_repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/repositories/ebd_repository.py)

Ha tambem modulos que usam `get_db()` diretamente:

- [events/repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/modules/events/repository.py)
- [devotionals/repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/modules/devotionals/repository.py)
- [missions/repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/modules/missions/repository.py)
- [governance/repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/modules/governance/repository.py)
- [prayer/repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/modules/prayer/repository.py)
- [expense/repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/modules/expense/repository.py)
- [tithe/repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/modules/tithe/repository.py)
- [ebd/repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/modules/ebd/repository.py)
- [financial/repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/modules/financial/repository.py)

### Infra local e CI

O ambiente local e os testes ainda assumem Firestore Emulator:

- [docker-compose.yml](/Users/leco/Documents/filadelfias/docker-compose.yml)
- [docker-compose.test.yml](/Users/leco/Documents/filadelfias/docker-compose.test.yml)
- [tests/conftest.py](/Users/leco/Documents/filadelfias/apps/backend/tests/conftest.py)
- [pytest.ini](/Users/leco/Documents/filadelfias/apps/backend/pytest.ini)
- [seed_dev_data.py](/Users/leco/Documents/filadelfias/apps/backend/src/scripts/seed_dev_data.py)
- [seed_e2e_data.py](/Users/leco/Documents/filadelfias/apps/backend/src/scripts/seed_e2e_data.py)

### Deploy e configuracao

O projeto ainda esta apontado para GCP/Firebase em multiplos lugares:

- Deploy backend Cloud Run em [backend.yml](/Users/leco/Documents/filadelfias/.github/workflows/backend.yml)
- Deploy web Firebase Hosting em [web.yml](/Users/leco/Documents/filadelfias/.github/workflows/web.yml)
- Config raiz do Firebase em [firebase.json](/Users/leco/Documents/filadelfias/firebase.json)
- Config web do Firebase Hosting em [apps/web/firebase.json](/Users/leco/Documents/filadelfias/apps/web/firebase.json)
- Regras e indices Firestore em [firestore.rules](/Users/leco/Documents/filadelfias/firestore.rules) e [firestore.indexes.json](/Users/leco/Documents/filadelfias/firestore.indexes.json)

### Frontend e mobile

O web e o mobile nao dependem de Firebase como backend transacional principal, mas carregam referencias de infraestrutura atual:

- API web em [api.ts](/Users/leco/Documents/filadelfias/apps/web/src/lib/api.ts)
- CSP com dominios `run.app`, `firebaseio.com` e `googleapis.com` em [index.html](/Users/leco/Documents/filadelfias/apps/web/index.html)
- URL mobile atual em [apps/mobile/.env](/Users/leco/Documents/filadelfias/apps/mobile/.env)
- Script Android com `run.app` em [build-android.sh](/Users/leco/Documents/filadelfias/apps/mobile/build-android.sh)

## O que precisa mudar de verdade

Esta migracao tem quatro frentes reais:

1. Persistencia do backend
2. Runtime local e testes
3. Deploy e operacao
4. Limpeza de configuracoes Firebase/GCP

Se qualquer uma dessas frentes ficar incompleta, o projeto continuara tecnicamente dependente da arquitetura antiga.

## Arquitetura alvo

### Backend alvo

- FastAPI continua como entrypoint HTTP.
- SQLAlchemy 2.x assíncrono com `asyncpg` vira a base de acesso a dados.
- Alembic vira o mecanismo oficial de schema evolution.
- Sessao de banco por request, injetada por dependency do FastAPI.
- Repositorios deixam de conhecer Firestore e passam a conhecer sessao assíncrona.
- Entidades do dominio continuam desacopladas do ORM, onde isso fizer sentido.

### Modelo de persistencia alvo

O projeto hoje usa uma estrutura naturalmente relacional, mesmo tendo sido implementado em NoSQL:

- usuarios pertencem a tenants via memberships
- members pertencem a tenants
- papeis/permissoes derivam de relacoes de usuario e contexto
- modulos financeiros, eventos, pedidos, EBD e outros giram ao redor de tenant, member e user

Isso favorece fortemente PostgreSQL e desfavorece a manutencao em Firestore.

### Infra alvo

- `api` containerizada
- `web` servida como estatico
- `postgres` persistido com volume dedicado
- deploy via Fleet sobre Kubernetes
- exposicao via Cloudflare Zero Trust

### Forma exata de deploy alvo

Com base na aplicacao `lettura`, a direcao de implementacao para `Filadelfias` deve seguir este desenho:

- `fleet.yaml` na raiz do repositorio apontando para `k8s/homelab`
- `k8s/homelab/kustomization.yaml` como ponto de agregacao principal
- manifests separados por recurso (`backend.yaml`, `web.yaml`, `postgres.yaml`, `configmap.yaml`, `namespace.yaml`, `secrets.yaml.example`, etc.)
- imagens vindas do GHCR e pinadas no `kustomization.yaml`
- `cloudflared` como componente do cluster para exposicao externa

Isso elimina uma das duvidas anteriores: para este projeto, o deploy nao sera modelado com Helm, nem com manifests ad hoc, nem com estrutura abstrata. O plano agora assume Kustomize no mesmo padrao da outra aplicacao.

## Entregaveis desta fase

- inventario dos pontos ativos Firebase/GCP
- definicao da arquitetura alvo
- lista de modulos por ordem de migracao
- decisão clara sobre o que sera removido, reescrito ou preservado como historico

## Criterio de saida da fase

Esta fase termina quando:

- a arquitetura alvo estiver fixa
- a ordem de migracao estiver aprovada
- os residuos Firebase/GCP estiverem explicitamente listados
- nao houver ambiguidade sobre compatibilidade hibrida
