# Plano 3: Governo e Ordem (Manual Presbiteriano)

**Objetivo**: Ferramentas para a governança da igreja, respeitando a ordem presbiteriana (ou congregacional conforme configuração), com segurança jurídica e eclesiástica.

---

## 1. Gestão de Conselhos e Liderança

### 1.1. Órgãos Colegiados
- [ ] Cadastro de órgãos: Conselho, Junta Diaconal, Assembleia.
- [ ] Membros ativos de cada órgão (mandatos com data de início e fim).

### 1.2. Gestão de Reuniões
- [ ] Pauta da reunião (Agenda).
- [ ] Convocação automática (Email/Push) com antecedência configurada.

---

## 2. Atas e Documentos Oficiais

### 2.1. Editor de Atas
- [ ] Editor de texto rico (Rich Text) para redação de atas.
- [ ] Versionamento de atas (Draft, Revisão, Aprovada, Publicada).
- [ ] Assinatura digital (simples log de quem aprovou/fechou a ata).

### 2.2. Repositório de Documentos
- [ ] Upload de Estatutos, Regimentos Internos.
- [ ] Busca full-text nos documentos.

---

## 3. Sistema de Votações e Eleições

*Crítico: Segurança e Auditoria.*

### 3.1. Eleições de Oficiais
- [ ] Configuração da Eleição:
    - Cargos em disputa.
    - Candidatos elegíveis.
    - Quem pode votar (colégio eleitoral: membros comungantes ativos).
- [ ] **Urna Virtual**:
    - Voto secreto (o banco grava *que* o usuário votou, mas o voto em si é desvinculado ou criptografado de forma irreversível em relação ao user).
    - Auditoria: Hash da votação para garantir que não houve alteração no banco.

### 3.2. Votações em Assembleia
- [ ] **Restrição Presencial**: O app deve garantir que o membro está na igreja para votar (via Geolocalização, Check-in via QR Code na tela da igreja, ou Token temporário liberado no culto).
- [ ] Votação em tempo real (Sim/Não/Abstenção).
- [ ] Usuários em casa (Online) podem assistir, mas não votam (salvo configuração específica).
- [ ] Exibição de resultados no projetor (Web View específica).

---

## 4. Módulo Disciplinar (Acesso Restritíssimo)
- [ ] Registro de casos disciplinares (apenas para Pastor/Relator).
- [ ] Arquivo morto (lacrado) após resolução.
- *Nota: Discutir sensibilidade desses dados na nuvem. Talvez apenas logs de que existe um caso físico, sem detalhes.*
