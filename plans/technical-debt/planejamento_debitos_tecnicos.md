# Planejamento de Débitos Técnicos e Refatoração

**Autor**: Senior Software Engineer (Agent)
**Data**: 2026-01-19
**Contexto**: Análise da arquitetura Backend (`apps/backend`) após a implementação das fases MVP.

O objetivo deste documento é mapear os débitos técnicos acumulados, analisar violações de princípios de engenharia (SOLID, Clean Code, DDD) e propor um plano de ação para garantir a escalabilidade e manutenibilidade do projeto.

---

## 1. Diagnóstico Arquitetural

A aplicação segue uma arquitetura baseada em camadas (Layered Architecture), mas apresenta sinais de acoplamento excessivo e baixa coesão em pontos críticos. A estrutura atual privilegia a velocidade inicial de desenvolvimento (RAD), mas cobra um preço na testabilidade e isolamento de módulos.

### 1.1. Estrutura de Pacotes (Package by Layer vs Feature)
Atualmente, utilizamos arquivos centralizadores (`models.py`, `schemas.py`, `repositories.py`).
*   **Problema**: Violação do **Single Responsibility Principle (SRP)**. O arquivo `models.py` muda por razões de negócio financeiro, educacional, governança, etc. Isso gera conflitos de merge e dificulta a navegação.
*   **Violação DDD**: Não há clareza visual dos *Bounded Contexts*. Domínios distintos (Financeiro vs Membros) estão misturados fisicamente.

### 1.2. Acoplamento com Infraestrutura (Dependency Inversion)
Os Services (ex: `EBDService`) recebem `AsyncSession` (SQLAlchemy) diretamente no construtor.
*   **Problema**: Violação do **Dependency Inversion Principle (DIP)**. A camada de aplicação/serviço depende de detalhes de implementação (SQLAlchemy AsyncSession) em vez de abstrações.
*   **Impacto**: Impossibilita testes unitários puros (sem banco de dados) para a lógica de negócio, forçando o uso de testes de integração lentos/pesados.

### 1.3. Regras de Negócio em Repositórios
Identificamos lógica de domínio dentro de repositórios, como em `FinancialRepository.create_transaction`.
*   **Problema**: Repositórios devem se limitar a colecionar e persistir agregados. A lógica de "atualizar saldo ao criar transação" é uma regra de negócio (Domain Service) e não de infraestrutura.
*   **Code Smell**: "Smart Repository".

### 1.4. Modelo de Domínio Anêmico
As entidades (`models.py`) são puras estruturas de dados (Data Classes com ORM).
*   **Problema**: A lógica reside inteiramente em "Services" procedurais ou, pior, misturada nos repositórios.
*   **Refatoração**: Mover comportamentos para dentro das entidades (ex: `account.debit(amount)` lançando exceção se saldo insuficiente).

---

## 2. Plano de Ação e Refatoração

As tarefas estão priorizadas por impacto na manutenibilidade e risco.

### Prioridade Alta (Imediato)

#### [ARCH-01] Modularização por Funcionalidade (Slicing)
Refatorar a estrutura de pastas para agrupar por domínio, não por camada técnica.
*   **De**:
    ```
    src/infra/models.py (Tudo aqui)
    src/infra/repositories.py (Tudo aqui)
    src/domain/schemas.py (Tudo aqui)
    ```
*   **Para**:
    ```
    src/modules/financial/
        ├── models.py
        ├── schemas.py
        ├── repository.py
        └── service.py
    src/modules/ebd/
        ├── models.py
        ...
    src/shared/infra/ (Base classes, DB config)
    ```
*   **Benefício**: Isola contextos, resolve SRP em arquivos gigantes.

#### [CODE-01] Limpeza de Repositórios (Clean Code)
Remover lógica de negócio dos repositórios.
*   **Ação**: Mover a lógica de atualização de saldo de `FinancialRepository.create_transaction` para `FinancialService.create_transaction` (usando transação atômica).
*   **Benefício**: Repositórios voltam a ser apenas coleções de acesso a dados.

### Prioridade Média (Médio Prazo)

#### [ARCH-02] Introdução de Interfaces de Repositório (DIP)
Criar classes abstratas (Protocolos) para os repositórios.
*   **Exemplo**:
    ```python
    class IFinancialRepository(Protocol):
        async def create_account(self, account: FinancialAccount) -> FinancialAccount: ...
    ```
*   **Ação**: Injetar `IFinancialRepository` nos Services, não `AsyncSession`. A implementação concreta (`SQLAlchemyFinancialRepository`) receberá a Session.
*   **Benefício**: Permite criar `FakeFinancialRepository` (em memória) para testes unitários ultrarrápidos.

### Prioridade Baixa (Longo Prazo / Evolutiva)

#### [DDD-01] Enriquecimento do Domínio
Refatorar Entidades para conter comportamento.
*   **Ação**: Adicionar métodos de negócio nos models (`Validation`, `State Transition`).
*   **Cuidado**: Balancear com o uso do SQLAlchemy (Active Record pattern vs Pure Domain Models). Sugestão: Manter models do SQLAlchemy, mas adicionar métodos de comportamento neles (`Hybrid Properties`, Methods).

---

## 3. Estratégia de Testes

1.  **Manter Integração**: Os testes atuais (`tests/integration/*.py`) são valiosos e garantem o funcionamento ponta a ponta. Devem ser mantidos.
2.  **Adicionar Unitários**: Após a refatoração [ARCH-02], adicionar testes unitários para a camada de Serviço zombando (mocking) os repositórios. Isso aumentará a cobertura de cenários de borda (ex: Erros de lógica complexa) sem o custo de I/O de banco.

---

## 4. Conclusão

O projeto está funcional e os testes de integração garantem a qualidade atual. No entanto, para suportar o crescimento na Fase 6 e além (SaaS), a modularização ([ARCH-01]) é mandatória para evitar o colapso da manutenibilidade. A inversão de dependência ([ARCH-02]) será crucial para manter a bateria de testes rápida e confiável.
