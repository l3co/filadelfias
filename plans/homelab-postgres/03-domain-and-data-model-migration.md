# Fase 3: Migracao do Modelo de Dados e dos Modulos

## Objetivo

Migrar o backend do modelo orientado a colecoes/subcolecoes do Firestore para um modelo relacional coerente com o dominio da aplicacao.

Como nao ha exigencia de migracao de dados existentes, esta fase deve priorizar um schema limpo, consistente e sustentavel, e nao reproduzir cegamente a estrutura antiga.

## Ordem da migracao

### Bloco A: Nucleo multi-tenant

Este bloco e obrigatorio antes dos outros porque ele sustenta autenticacao, escopo tenant e quase todos os relacionamentos.

Objetos principais:

- `users`
- `tenants`
- `memberships`
- `members`

O que precisa ser resolvido aqui:

- identidade do usuario
- associacao usuario <-> tenant
- papel/oficio/permissao no contexto correto
- member profile associado ao tenant

### Bloco B: Camada de autorizacao e metadata

Depois do nucleo:

- regras de permissao
- enums centrais
- metadata servida para web/mobile

Aqui a questao principal e decidir o que fica em codigo e o que vira tabela.

### Bloco C: Modulos transacionais

Migrar em seguida os modulos que mais dependem do tenant e do usuario autenticado:

- financeiro
- dizimos/ofertas
- despesas
- governanca

### Bloco D: Modulos de comunidade e agenda

- prayer
- events
- missions
- devotionals
- ebd

## Estrutura relacional sugerida

### Tabelas base

- `users`
  - id
  - email
  - hashed_password
  - full_name
  - is_active
  - must_change_password
  - created_at
  - updated_at

- `tenants`
  - id
  - name
  - slug
  - status
  - created_at
  - updated_at

- `memberships`
  - id
  - user_id
  - tenant_id
  - office
  - role
  - status
  - joined_at
  - created_at
  - updated_at

- `members`
  - id
  - tenant_id
  - user_id nullable se membro nao tiver conta vinculada
  - full_name
  - email
  - phone
  - status
  - birth_date
  - metadata adicional se necessario
  - created_at
  - updated_at

### Convencoes

- UUID como PK
- FKs explicitas
- `tenant_id` em tudo que for tenant-scoped
- `created_at`/`updated_at` com timezone
- constraints de unicidade por tenant quando fizer sentido

## Mapeamento por tipo de codigo

### O que sera reescrito

- repositorios base Firestore
- queries por `collection.where(...)`
- estruturas de subcolecao por tenant

### O que sera preservado com adaptacao

- routers FastAPI
- schemas Pydantic
- regras de dominio onde nao dependam da forma de persistencia

### O que sera reavaliado

- ids gerados na borda
- timestamps manuais
- pseudo-relacionamentos implícitos hoje codificados em documentos

## Estrategia por modulo

Para cada modulo, o trabalho deve seguir a mesma sequencia:

1. ler router
2. ler schema
3. identificar queries e filtros atuais
4. modelar tabela(s)
5. criar migration
6. implementar repository relacional
7. adaptar service/use case
8. ajustar testes
9. remover versao Firestore

## Riscos reais desta fase

- modelagem errada do nucleo multi-tenant contaminar o resto
- reproduzir estrutura de documento em tabelas sem normalizacao suficiente
- deixar permissoes dependentes demais de condicao espalhada em codigo
- criar migrations sem revisar indices e unicidades

## Decisao importante

Nao faz sentido migrar modulo a modulo mantendo Firestore e Postgres como iguais por muito tempo. A estrategia correta e:

- primeiro fundacao
- depois nucleo
- depois corte progressivo dos modulos
- no final, remocao total do legado Firestore

## Criterio de saida da fase

Esta fase termina quando:

- todos os modulos backend estiverem em PostgreSQL
- nao existir import ativo de `src.infra.firebase`
- nao existir import ativo de `src.infra.firestore_repository`
- o schema relacional cobrir os fluxos funcionais principais
