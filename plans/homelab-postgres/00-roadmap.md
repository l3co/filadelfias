# Roadmap de Migracao: Firebase/GCP -> Homelab + PostgreSQL

## Objetivo

Este roadmap organiza a migracao do projeto para uma arquitetura self-hosted no homelab, removendo Firestore/Firebase/GCP do caminho principal da aplicacao e substituindo a persistencia por PostgreSQL assincrono com FastAPI.

O projeto nao esta em producao funcional. Por isso, a estrategia correta aqui nao e fazer compatibilidade prolongada nem migracao de dados legados; e simplificar o sistema, acertar a arquitetura e estabilizar uma base limpa para seguir o desenvolvimento.

## Premissas Confirmadas

- O trabalho sera executado exclusivamente na branch `codex/homelab-postgres-migration`.
- Nao ha necessidade de preservar ou migrar dados existentes do Firestore.
- O backend deve usar PostgreSQL em modo assincrono.
- O destino de execucao e o homelab:
  - Ubuntu Server
  - Kubernetes da stack OpenSUSE
  - Fleet para entrega automatizada
  - Cloudflare Zero Trust para roteamento/exposicao

## Padrao Operacional Confirmado no Homelab

Com base na aplicacao de referencia `lettura`, o padrao real do ambiente nao sera assumido genericamente. O plano passa a seguir explicitamente esta estrutura:

- Fleet usando [fleet.yaml](/Users/leco/Documents/lettura/fleet.yaml) apontando para `k8s/homelab`
- manifests organizados com Kustomize em `k8s/homelab`
- imagens versionadas no `kustomization.yaml`
- backend publicado a partir de imagem em GHCR
- PostgreSQL rodando no cluster como `StatefulSet + PVC + Service headless`
- configuracao consumida via `ConfigMap` e `Secret`
- `imagePullSecrets` para acesso ao GHCR
- exposicao externa via `cloudflared` rodando no cluster

## Resultado Esperado

Ao fim da migracao, o projeto deve ter:

- backend FastAPI rodando sobre PostgreSQL assincrono
- repositorios Firestore removidos
- ambiente local baseado em PostgreSQL
- testes desacoplados do emulador Firestore
- deploy preparado para Kubernetes/Fleet
- web e mobile configurados para consumir a nova API
- residuos ativos de Firebase/GCP removidos ou explicitamente arquivados

## Estrutura do Planejamento

- [01-discovery-and-target-architecture.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/01-discovery-and-target-architecture.md)
  Mapeamento do estado atual, pontos de dependencia em Firebase/GCP e arquitetura alvo.

- [02-backend-postgres-foundation.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/02-backend-postgres-foundation.md)
  Fundacao tecnica do backend assíncrono com SQLAlchemy + asyncpg + Alembic.

- [03-domain-and-data-model-migration.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/03-domain-and-data-model-migration.md)
  Quebra detalhada da migracao de modulos e modelagem relacional.

- [04-app-runtime-and-test-migration.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/04-app-runtime-and-test-migration.md)
  Ambiente local, scripts, seeds, CI, testes e ajustes de runtime web/mobile.

- [05-homelab-deploy-and-cutover.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/05-homelab-deploy-and-cutover.md)
  Estrutura de deploy no homelab com Kubernetes, Fleet e Cloudflare Zero Trust.

- [06-firebase-gcp-decommission-checklist.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/06-firebase-gcp-decommission-checklist.md)
  Checklist operacional do que precisa ser removido, reescrito ou preservado como historico.

## Sequencia de Execucao

### Etapa 0: Planejamento executavel

- Confirmar inventario tecnico do estado atual.
- Congelar a direcao arquitetural.
- Organizar backlog tecnico por dependencia e por risco.

### Etapa 1: Fundacao do backend relacional

- Introduzir stack real de banco no backend.
- Criar infraestrutura de sessao assincrona.
- Definir base ORM, metadata, conventions e migrations.

### Etapa 2: Migracao do nucleo do dominio

- Migrar `users`, `tenants`, `memberships`, `members`.
- Ajustar autenticacao, autorizacao e escopo tenant.
- Validar contratos com web e mobile.

### Etapa 3: Migracao dos modulos funcionais

- Reescrever persistencia de `governance`, `financial`, `prayer`, `events`, `missions`, `ebd`, `tithe`, `expense`, `devotionals`.
- Remover codigo Firestore residual.

### Etapa 4: Runtime, qualidade e testes

- Trocar Docker Compose para PostgreSQL.
- Reescrever testes e fixtures.
- Atualizar seeds e CI.

### Etapa 5: Deploy homelab

- Versionar manifests/estrutura Fleet seguindo o padrao `k8s/homelab`.
- Publicar `api`, `web` e `postgres`.
- Integrar Cloudflare Zero Trust.

### Etapa 6: Limpeza final

- Remover referencias ativas a Firebase/GCP.
- Atualizar docs.
- Fechar checklist de descomissionamento.

## Principios de Execucao

1. Nao manter dois modelos de persistencia por muito tempo.
2. Nao adiar deploy do homelab para o fim sem manifestos versionados.
3. Nao deixar docs enganarem mais do que o codigo executavel.
4. Comecar pelo nucleo multi-tenant antes dos modulos satelite.
5. Tratar a migracao como simplificacao arquitetural, nao como mera troca de fornecedor.

## Ordem de Revisao Recomendada

Se voce quiser revisar o planejamento com maximo detalhamento, a ordem correta e:

1. [01-discovery-and-target-architecture.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/01-discovery-and-target-architecture.md)
2. [02-backend-postgres-foundation.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/02-backend-postgres-foundation.md)
3. [03-domain-and-data-model-migration.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/03-domain-and-data-model-migration.md)
4. [04-app-runtime-and-test-migration.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/04-app-runtime-and-test-migration.md)
5. [05-homelab-deploy-and-cutover.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/05-homelab-deploy-and-cutover.md)
6. [06-firebase-gcp-decommission-checklist.md](/Users/leco/Documents/filadelfias/plans/homelab-postgres/06-firebase-gcp-decommission-checklist.md)
