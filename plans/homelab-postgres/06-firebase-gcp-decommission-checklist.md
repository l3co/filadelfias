# Fase 6: Checklist de Remocao de Firebase/GCP

## Objetivo

Garantir que a migracao nao termine com o projeto ainda carregando residuos ativos de Firebase/GCP em codigo, runtime, CI ou documentacao.

## Backend

- remover [firebase.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/firebase.py)
- remover [firestore_repository.py](/Users/leco/Documents/filadelfias/apps/backend/src/infra/firestore_repository.py)
- remover imports ativos de `get_db()`
- remover dependencia `firebase-admin` de [pyproject.toml](/Users/leco/Documents/filadelfias/apps/backend/pyproject.toml)
- remover marcadores e fixtures Firestore de testes

## Ambiente local

- remover servico `firebase` de [docker-compose.yml](/Users/leco/Documents/filadelfias/docker-compose.yml)
- remover Firestore Emulator de [docker-compose.test.yml](/Users/leco/Documents/filadelfias/docker-compose.test.yml) se ele permanecer relevante
- remover env vars `FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`, `GOOGLE_APPLICATION_CREDENTIALS` do fluxo ativo

## CI/CD

- remover deploy Cloud Run de [backend.yml](/Users/leco/Documents/filadelfias/.github/workflows/backend.yml)
- remover deploy Firebase Hosting de [web.yml](/Users/leco/Documents/filadelfias/.github/workflows/web.yml)
- remover uso de Firestore Emulator em testes E2E do web
- substituir pipelines por build/test/deploy aderentes ao homelab

## Configuracoes de Firebase

- revisar [firebase.json](/Users/leco/Documents/filadelfias/firebase.json)
- revisar [apps/web/firebase.json](/Users/leco/Documents/filadelfias/apps/web/firebase.json)
- revisar [apps/web/.firebaserc](/Users/leco/Documents/filadelfias/apps/web/.firebaserc)
- revisar [firestore.rules](/Users/leco/Documents/filadelfias/firestore.rules)
- revisar [firestore.indexes.json](/Users/leco/Documents/filadelfias/firestore.indexes.json)

Decisao necessaria para cada item:

- apagar
- arquivar como historico
- manter temporariamente fora do caminho principal

## Frontend e mobile

- trocar URLs `run.app`
- revisar CSP para remover `firebaseio.com` e `googleapis.com` se nao houver outra dependencia legitima
- revisar docs e scripts com `web.app`

## Documentacao

Arquivos com referencias operacionais antigas precisam ser atualizados ou explicitamente arquivados:

- [README.md](/Users/leco/Documents/filadelfias/README.md)
- [apps/backend/README.md](/Users/leco/Documents/filadelfias/apps/backend/README.md)
- [apps/web/README.md](/Users/leco/Documents/filadelfias/apps/web/README.md)
- [docs/architecture.md](/Users/leco/Documents/filadelfias/docs/architecture.md)
- [docs/ENVIRONMENT_VARIABLES.md](/Users/leco/Documents/filadelfias/docs/ENVIRONMENT_VARIABLES.md)
- [docs/README.md](/Users/leco/Documents/filadelfias/docs/README.md)
- [docs/tech-stack.md](/Users/leco/Documents/filadelfias/docs/tech-stack.md)
- [docs/planejamento-firebase.md](/Users/leco/Documents/filadelfias/docs/planejamento-firebase.md)
- [docs/contributing.md](/Users/leco/Documents/filadelfias/docs/contributing.md)

## Estado final desejado

Ao fim do processo:

- Firebase/GCP nao devem ser dependencia ativa da aplicacao
- qualquer artefato restante deve estar claramente marcado como historico
- nao deve existir configuracao operacional enganosa apontando para GCP

## Perguntas que este checklist responde

- ainda existe codigo que depende de Firebase?
- ainda existe pipeline que depende de GCP?
- ainda existe teste que depende do emulador Firestore?
- ainda existe documentacao que manda usar Cloud Run/Firebase Hosting?
- ainda existe endpoint, CSP ou variavel de ambiente apontando para a infraestrutura antiga?
