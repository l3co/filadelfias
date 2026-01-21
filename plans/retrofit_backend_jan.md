# 🛠️ Retrofit Report: Filadélfias Backend (Jan 2026)

**Data**: 21/01/2026  
**Responsável**: Gemini (Agente de Engenharia de Software)  
**Contexto**: Análise de maturidade do backend após migração PostgreSQL → Firestore.

---

## 📊 Resumo Executivo

O projeto encontra-se em um **estado híbrido e perigoso**.
Embora a lógica de persistência (`repositories`) tenha sido migrada para o Firestore, toda a **infraestrutura de suporte** (dependências, configuração de banco, testes e scripts de CI) ainda está fortemente acoplada ao PostgreSQL.

O código "roda" porque a implementação dos repositórios foi alterada, mas o projeto carrega um **peso morto** significativo e, o mais crítico: **os testes atuais não validam a realidade da produção**.

### 🚦 Semáforo de Saúde

- **Arquitetura de Código (Application/Domain):** 🟢 **Bom**. O uso do padrão Repository salvou o projeto. A troca de banco foi possível sem reescrever tudo graças a essa desacoplação.
- **Implementação do Firestore:** 🟡 **Regular**. O uso de `TenantScopedRepository` é positivo, mas há riscos de leituras excessivas (N+1) se a modelagem continuar pensando como SQL.
- **Testes Automatizados:** 🔴 **Crítico**. `conftest.py` sobe um container Postgres. Seus testes estão testando uma realidade que não existe mais, ou estão completamente quebrados/ignorados.
- **Saúde do Repositório (Deps/Files):** 🔴 **Ruim**. Presença de código "zumbi" (SQLAlchemy, Alembic, drivers SQL) que confunde desenvolvedores e incha os containers.

---

## 🔍 Análise Detalhada

### 1. O Problema dos "Fantasmas SQL"
O arquivo `pyproject.toml` e a estrutura de pastas contam uma história de um projeto SQL.
**Arquivos/Deps que devem ser removidos imediatamente:**
- ❌ **Libs:** `sqlalchemy`, `asyncpg`, `alembic`, `psycopg2-binary` (se houver).
- ❌ **Arquivos:**
    - `src/infra/database.py`: Configura `AsyncSession` do SQLAlchemy.
    - `src/infra/models/`: Se conter classes herdando de `Base` (SQLAlchemy Declarative).
    - `alembic/` & `alembic.ini`: Migrações de schema SQL não funcionam no Firestore.

### 2. A Situação dos Testes (Prioridade 1)
Seus testes (`tests/conftest.py`) estão configurados para:
1. Subir um container Docker com Postgres.
2. Criar tabelas (`Base.metadata.create_all`).
3. Injetar uma `AsyncSession` SQL nos endpoints.

**Por que isso é grave:**
Como seus repositórios reais (`src/infra/repositories/*`) agora usam `FirestoreRepository`, quando o teste roda, ele tenta injetar dependências SQL onde o código espera comportamento NoSQL (ou o código de teste "mocka" o repositório inteiro e não testa a integração real).
**Você não tem garantia nenhuma de que o código funciona no Firestore só rodando `pytest` hoje.**

### 3. Implementação NoSQL
Sua classe base `FirestoreRepository` (`src/infra/firestore_repository.py`) é um bom começo.
**Pontos positivos:**
- Abstração genérica.
- `TenantScopedRepository`: Excelente para garantir isolamento de dados entre igrejas (multitenancy focado na collection pai).

**Pontos de Atenção:**
- **Índices:** O Firestore exige índices compostos para certas queries (`where X == a AND Y > b`). No SQL isso é automático ou fácil de adicionar. No Firestore, se o índice não existir, a query quebra em produção.
    - *Recomendação:* Criar um arquivo `firestore.indexes.json` na raiz para versionar esses índices.
- **Transações:** Não vi uso explícito de transações (`batch` ou `transaction`) em operações críticas (ex: criar usuário + criar membership). Se falhar no meio, seu banco fica inconsistente.

---

## 🚀 Plano de Ação: Retrofit

Recomendo executar este plano em 3 fases para sanear o projeto.

### Fase 1: Limpeza (The Purge)
*Objetivo: Remover código morto e dependências SQL.*

1.  Remover dependências: `poetry remove sqlalchemy asyncpg alembic testcontainers[postgres]`.
2.  Apagar pasta `alembic/` e arquivo `alembic.ini`.
3.  Apagar `src/infra/database.py`.
4.  Revisar `src/main.py` e remover middlewares ou eventos de startup que conectam no Postgres.

### Fase 2: Consertar a Fundação de Testes
*Objetivo: Fazer o CI testar o que vai para produção.*

1.  **Adicionar Emulador Firestore:**
    - Opção A (Recomendada): Usar o emulador oficial do Firebase via Docker em `conftest.py`.
    - Opção B: Usar `mock-firestore` (mais leve, mas menos fidedigno).
2.  Reescrever `conftest.py`:
    - Remover fixtures `postgres_container`, `engine`, `db_session`.
    - Criar fixture `firestore_client` que conecta no emulador (resetando o estado entre testes).
3.  Atualizar `seed_e2e_data.py`:
    - Já vi que você começou a usar o script de seed. Ele deve ser a fonte da verdade para o estado inicial dos testes.

### Fase 3: Refactor Pós-Migração
*Objetivo: Otimizar o código para NoSQL.*

1.  **Denormalização Controlada:**
    - Em SQL, fazemos `JOIN Users ON Membership.user_id = Users.id`.
    - Em NoSQL, muitas vezes vale a pena salvar `{ id: 1, name: "Maria", email: "..." }` *dentro* do documento de Membership para evitar leituras extras. Avalie onde isso é necessário no seu app.
2.  **Validação de Schema:**
    - Como o Firestore não valida schema, garanta que o Pydantic (`src/domain` ou `src/schemas`) esteja sendo rigoroso na entrada e na saída dos repositórios.

---

### 📝 Conclusão

A migração "aconteceu", mas o paciente ainda está na mesa de cirurgia aberto. A estrutura `backend` precisa ser fechada e suturada (remoção do SQL) para garantir longevidade.

**Próximo Passo Sugerido:** Quer que eu comece a **Fase 1 (Limpeza)** agora mesmo? Posso remover as dependências e arquivos SQL para limpar a visão do projeto.
