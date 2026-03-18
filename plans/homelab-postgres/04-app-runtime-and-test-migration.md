# Fase 4: Runtime Local, Seeds, Testes e Aplicacoes Cliente

## Objetivo

Trocar o ecossistema de execucao e validacao do projeto, hoje centrado em Firestore Emulator e deploy GCP, para um ciclo coerente com PostgreSQL e homelab.

## Ambiente local

### Situacao atual

O ambiente local ainda sobe:

- emulador Firestore
- API
- seed
- web

via [docker-compose.yml](/Users/leco/Documents/filadelfias/docker-compose.yml).

### O que precisa acontecer

O novo ambiente local precisa subir:

- `postgres`
- `api`
- `seed` se ainda fizer sentido
- `web`

Pontos importantes:

- `api` precisa aguardar readiness do Postgres
- migrations precisam aplicar automaticamente ou via job separado
- seeds precisam popular dados compativeis com schema relacional

## Seeds

Os scripts atuais de seed ainda assumem Firestore:

- [seed_dev_data.py](/Users/leco/Documents/filadelfias/apps/backend/src/scripts/seed_dev_data.py)
- [seed_e2e_data.py](/Users/leco/Documents/filadelfias/apps/backend/src/scripts/seed_e2e_data.py)

Eles precisam ser reescritos para:

- usar sessao assíncrona
- popular o schema novo
- serem idempotentes quando necessario
- refletir cenarios usados pelo web e pelo E2E

## Testes backend

### Problema atual

O backend ainda tem fixtures e marcadores `firestore`:

- [tests/conftest.py](/Users/leco/Documents/filadelfias/apps/backend/tests/conftest.py)
- [pytest.ini](/Users/leco/Documents/filadelfias/apps/backend/pytest.ini)

### Meta

Os testes backend devem passar a usar:

- Postgres de teste local
- ou Testcontainers com Postgres
- fixtures de sessao/transacao
- limpeza por transacao ou truncation controlada

### Tipos de teste a revisar

- unitarios que hoje dependem de repositorio Firestore
- integracao HTTP com banco real
- smoke tests do fluxo de auth e tenancy

## Testes web

O workflow web atual ainda sobe Firestore Emulator para E2E em [web.yml](/Users/leco/Documents/filadelfias/.github/workflows/web.yml).

Isso deve ser substituido por:

- Postgres
- backend com migrations aplicadas
- seed relacional
- web buildado apontando para a API local de teste

## Mobile e web

### Web

O web precisa de ajustes pequenos, mas obrigatorios:

- CSP em [index.html](/Users/leco/Documents/filadelfias/apps/web/index.html)
- remover dominios GCP/Firebase desnecessarios
- manter apenas o necessario para a nova URL da API e servicos externos reais

### Mobile

O mobile nao precisa mudar de arquitetura, mas precisa mudar de configuracao:

- nova `EXPO_PUBLIC_API_URL`
- possiveis ajustes em scripts de build
- validacao dos fluxos auth contra o backend novo

## CI

### Backend

O pipeline deve parar de ignorar testes `firestore` e passar a validar o banco real da aplicacao.

### Web

O pipeline deve parar de depender do emulador Firestore.

### Mobile

Ainda nao ha workflow correspondente. A migracao e uma oportunidade para decidir:

- se entra workflow minimo para mobile
- ou se o mobile fica com validacao local/manual por enquanto

## Criterio de saida da fase

Esta fase termina quando:

- desenvolvedor consegue subir o projeto localmente com PostgreSQL
- seeds funcionam sem Firestore
- backend e web conseguem rodar seus testes sem Firebase Emulator
- web e mobile falam com a nova API sem referencias obrigatorias a GCP
