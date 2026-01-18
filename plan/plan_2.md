# Plano 2: Vida Comunitária e Pastoral

**Objetivo**: Implementar ferramentas que apoiem a rotina da igreja, cuidado pastoral e organização dos cultos.

---

## 1. Cadastro e Perfil de Membros

### 1.1. Gestão de Dados (Membros)
- [ ] Extensão do modelo `User` para `MemberProfile`.
    - Dados: Data nascimento, Data batismo, Estado Civil, Cônjuge, Filhos.
    - Dados eclesiásticos: Cargo (Membro, Diácono, Presbítero, Pastor), Data admissão, Modo admissão (Batismo, Transferência).
- [ ] **Privacidade**: Usuário define quais dados são públicos para outros membros (ex: telefone, endereço).

### 1.2. Diretório de Membros
- [ ] Lista de membros com busca (só para membros autenticados).
- [ ] Visualização de aniversariantes do mês.

---

## 2. Cuidado Pastoral

### 2.1. Pedidos de Oração
- [ ] **Backend**: CRUD `PrayerRequest`.
    - Campos: Descrição, Autor (opcional/anônimo), Alvo, Visibilidade (Pública, Apenas Pastores, Apenas Pequeno Grupo).
- [ ] **Frontend**:
    - Lista de oração.
    - Botão "Orei por você" (engajamento espiritual).

### 2.2. Visitação
- [ ] **Backend**: CRUD `VisitationLog` (Acesso restrito a Oficiais).
    - Campos: Data, Membro visitado, Visitantes (Oficiais), Resumo, Flag "Confidencial".
- [ ] **Relatórios**: Alerta de membros não visitados há X meses.

---

## 3. Gestão de Culto e Ministérios

### 3.1. Escalas (Rosters)
- [ ] **Modelagem**:
    - `Ministry` (Louvor, Recepção, Mídia, Infantil).
    - `Volunteer` (Membro vinculado a um ministério).
    - `Roster` (Escala): Data, Evento, Pessoas alocadas em funções.
- [ ] **Funcionalidade**:
    - Gerar escala (manual).
    - Membro aceita/recusa escala no App.
    - Notificação (Push/Email) lembrando da escala.

### 3.2. Ministério de Música e Coral
- [ ] **Gestão de Repertório**:
    - Cadastro de músicas (Título, Autor, Tonalidade).
    - Upload de arquivos de apoio (Cifras em PDF, Áudio MP3/Link Youtube para ensaio).
- [ ] **Ensaios**:
    - Agendamento de ensaios (separado do calendário geral da igreja, visível apenas para o grupo de música).
    - Lista de músicas do ensaio ("Setlist").
    - Confirmação de presença no ensaio.

### 3.3. Calendário de Eventos
- [ ] CRUD `Event`: Data, Hora, Local, Tipo (Culto, EBD, Vigília).
- [ ] Integração com mapa para localização.
- [ ] Check-in em eventos (opcional, bom para assembleias).

---

## 4. Geolocalização (Geo)
- [ ] Mapa de membros (clusterizado para privacidade em zoom out).
- [ ] Objetivo: Estimular caronas e criação de pequenos grupos por proximidade.
- [ ] **Tech**: PostGIS (se usar Postgres) ou cálculos simples de Haversine no App se a base for pequena.
