# Fase 5: Deploy no Homelab com Kubernetes, Fleet e Cloudflare Zero Trust

## Objetivo

Traduzir a aplicacao para o ambiente operacional real desejado: seu homelab.

Esta fase nao deve ser tratada como um detalhe final. O deploy alvo influencia:

- variaveis de ambiente
- probes
- persistencia do banco
- estrategia de imagem
- nomes de servicos
- roteamento externo

## Estrutura alvo

### Workloads

- `filadelfias-api`
- `filadelfias-web`
- `filadelfias-postgres`
- `filadelfias-cloudflared` se o tunnel deste projeto for gerenciado no mesmo padrao da aplicacao de referencia

### Recursos minimos

- StatefulSet para Postgres
- PVC para Postgres
- Service headless para Postgres
- Deployment para API
- Service interno para API
- Deployment para Web
- Service interno para Web

### Exposicao

Como voce usa Cloudflare Zero Trust, a direcao mais coerente e:

- expor a aplicacao via `cloudflared` no cluster
- evitar expor diretamente a API/publicar portas cruas no host

## Padrao de implementacao confirmado

Com base na outra aplicacao do mesmo ambiente, o plano de `Filadelfias` passa a assumir:

- `fleet.yaml` com `kustomize.dir: k8s/homelab`
- `k8s/homelab/kustomization.yaml` como agregador principal
- imagens em GHCR com tags atualizadas no `kustomization.yaml`
- `imagePullSecrets` no workload da API e dos demais componentes privados
- `ConfigMap` e `Secret` como fonte padrao de configuracao

Arquivos de referencia usados para fixar essa direcao:

- [fleet.yaml](/Users/leco/Documents/lettura/fleet.yaml)
- [kustomization.yaml](/Users/leco/Documents/lettura/k8s/homelab/kustomization.yaml)
- [backend.yaml](/Users/leco/Documents/lettura/k8s/homelab/backend.yaml)
- [postgres.yaml](/Users/leco/Documents/lettura/k8s/homelab/postgres.yaml)
- [cloudflared.yaml](/Users/leco/Documents/lettura/k8s/base/cloudflared.yaml)

## O que precisa ser versionado

O repositório precisa conter a configuracao suficiente para reproduzir deploy:

- `fleet.yaml`
- `k8s/homelab/kustomization.yaml`
- manifests por recurso
- `secrets.yaml.example`
- overlays somente se realmente houver necessidade

Nao faz sentido depender de configuracoes manuais dispersas fora do repositório.

## API

### Requisitos de deploy

- readiness probe em endpoint HTTP
- liveness probe em endpoint HTTP
- variaveis de ambiente do banco
- secret para `DATABASE_URL` ou componentes equivalentes
- `SECRET_KEY`
- CORS alinhado com o dominio real do web

### Imagem

O Dockerfile do backend deve ser:

- independente de Cloud Run
- consistente com migrations
- preparado para subida previsivel em Kubernetes
- alinhado com publicacao em GHCR

## Web

### Requisitos

- imagem estatica simples
- runtime config ou build config consistente com a URL publica da API
- CSP ajustada para a nova topologia

## PostgreSQL

### Requisitos operacionais minimos

- volume persistente
- credenciais fora da imagem
- politica clara de backup
- estrategia de restore testavel

Como nao estamos em producao ainda, nao e necessario superengenharia. Mas precisa haver:

- persistencia real
- backup minimamente pensado
- procedimento de recriacao

### Forma de execucao escolhida

O PostgreSQL para `Filadelfias` deve seguir o mesmo padrao da aplicacao `lettura`:

- `PersistentVolumeClaim`
- `StatefulSet`
- `Service` com `clusterIP: None`

Isso significa:

- identidade estavel do pod do banco
- armazenamento persistente desacoplado do ciclo de vida do pod
- resolucao DNS interna estavel para conexao da API ao host `postgres`

Para este projeto, isso deixa de ser opcao em aberto e passa a ser direcao definida do plano.

## Fleet

O objetivo aqui nao e discutir o Fleet abstratamente, e sim garantir que os artefatos do repositório possam ser consumidos pelo seu fluxo de entrega.

Portanto, esta fase inclui:

- organizar manifests em estrutura consumivel pelo Fleet no formato `k8s/homelab`
- definir como secrets serao injetados
- garantir separacao de configuracoes entre local e homelab

## Migrations no cluster

Ainda existe uma decisao de execucao a fechar: se as migrations do banco serao aplicadas por `Job` dedicado ou no startup da API.

Como seu ambiente de referencia ja possui um `Job` separado para migracao, a recomendacao inicial do plano passa a ser:

- preferir `Job` dedicado para migration
- evitar depender do startup da API para evolucao de schema

Isso reduz acoplamento entre rollout da API e mudanca de schema e segue o padrao operacional que voce ja usa.

## Cutover

Como nao ha producao funcional, o cutover e simples:

1. subir stack no homelab
2. validar banco e migrations
3. validar API
4. validar web
5. apontar mobile para a nova API
6. encerrar dependencia operacional do GCP

## Criterio de saida da fase

Esta fase termina quando:

- a aplicacao sobe no homelab
- a API responde externamente via Cloudflare Zero Trust
- o web e acessivel no dominio/rota esperados
- o Postgres persiste dados corretamente
- o deploy pode ser repetido sem passos manuais obscuros
