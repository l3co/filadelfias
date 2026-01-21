# Seed Script - Igreja Presbiteriana Filadélfia

Este script popula o banco de dados Firestore com dados realistas para desenvolvimento e testes.

## O que é criado

- **Igreja**: Igreja Presbiteriana Filadélfia
- **Usuário Admin**: Leandro (l3co@outlook.com)
- **Membros**: 55 membros com dados variados
- **Classes de EBD**: 10 classes com alunos e lições
- **Contas Financeiras**: 4 contas com transações dos últimos 3 meses
- **Total de usuários com login**: ~17 usuários (admin + 30% dos membros)

## Credenciais

- **Email Admin**: l3co@outlook.com
- **Senha de todos os usuários**: mudar@123

## Como executar

### Opção 1: Com Firestore Emulator Local (Desenvolvimento)

```bash
# 1. Inicie o emulador do Firestore
docker run -d -p 8080:8080 mtlynch/firestore-emulator

# 2. Execute o seed
cd apps/backend
FIRESTORE_EMULATOR_HOST=localhost:8080 PROJECT_ID=filadelfias-dev poetry run python -m src.scripts.seed_dev_data
```

### Opção 2: Com Firestore em Produção (Cuidado!)

```bash
cd apps/backend
# Configure as credenciais do Google Cloud primeiro
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
export PROJECT_ID=filadelfias-6a116

# Execute o seed
poetry run python -m src.scripts.seed_dev_data
```

## Estrutura de Dados Criada

### Membros
- Nomes brasileiros realistas
- Idades variadas (1940-2010)
- Funções: Presbítero, Diácono, Líder de Louvor, Professor EBD, etc.
- 30% dos membros têm conta de usuário para login

### EBD
- 10 classes por faixa etária (Berçário até Terceira Idade)
- 5-15 alunos por classe
- 4 lições registradas (último mês)

### Financeiro
- 4 contas: Caixa Geral, Dízimos e Ofertas, Missões, Construção
- ~200 transações nos últimos 3 meses
- Categorias: Dízimos, Ofertas, Aluguel, Energia, Água, etc.

## Notas

- O script limpa dados existentes da igreja antes de criar novos
- Todos os IDs são UUIDs v4
- Datas são realistas (aniversários, batismos, etc.)
- Transações financeiras são distribuídas aleatoriamente nos últimos 90 dias
