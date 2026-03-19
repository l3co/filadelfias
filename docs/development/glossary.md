# Glossário de Termos — Filadelfias

Este documento define os termos do domínio eclesiástico e técnico usados no projeto.

---

## 📖 Termos Eclesiásticos (Ubiquitous Language)

| Termo | Definição |
|-------|-----------|
| **Membro Comungante** | Cristão batizado que fez profissão de fé e participa ativamente da Santa Ceia. Tem direito a voto em assembleias. |
| **Membro Não-Comungante** | Geralmente crianças batizadas que ainda não fizeram profissão de fé. |
| **Frequentador** | Pessoa que frequenta a igreja regularmente mas não é membro formal. |
| **Visitante** | Pessoa que compareceu a um ou poucos cultos, não possui vínculo. |
| **Presbítero** | Oficial eleito para governar a igreja junto com o Pastor. Participa do Conselho. |
| **Diácono** | Oficial eleito para servir nas obras de misericórdia e assistência. Participa da Junta Diaconal. |
| **Pastor** | Presbítero docente, ordenado ao ministério da Palavra e Sacramentos. |
| **Conselho** | Órgão deliberativo composto pelo Pastor e Presbíteros regentes. Governa a igreja local. |
| **Junta Diaconal** | Órgão formado pelos Diáconos para gestão assistencial. |
| **Assembleia** | Reunião deliberativa de todos os membros comungantes da igreja. |
| **Quórum** | Número mínimo de membros presentes para validar uma votação. |
| **Ata** | Documento oficial que registra as deliberações de uma reunião. |
| **Rol de Membros** | Lista oficial de todos os membros da igreja. |
| **Carta de Transferência** | Documento que permite a um membro transferir-se para outra igreja. |
| **Profissão de Fé** | Declaração pública de fé em Cristo, requisito para tornar-se membro comungante. |
| **Batismo** | Sacramento de iniciação na comunidade cristã. |
| **Santa Ceia** | Sacramento de comunhão, celebrado periodicamente. |
| **Escola Bíblica Dominical (EBD)** | Programa de ensino bíblico sistemático, geralmente aos domingos. |
| **SAF** | Sociedade Auxiliadora Feminina. |
| **UMP** | União de Mocidade Presbiteriana. |
| **UPH** | União Presbiteriana de Homens. |

---

## 💻 Termos Técnicos

| Termo | Definição |
|-------|-----------|
| **Tenant** | Uma igreja específica no sistema multi-tenant. Cada tenant tem seus dados isolados. |
| **Multi-tenant** | Arquitetura onde múltiplas organizações (igrejas) compartilham a mesma aplicação. |
| **Usuário Órfão** | Usuário cadastrado na plataforma mas não vinculado a nenhuma igreja. |
| **Role** | Papel/função que define as permissões de um usuário dentro de uma igreja. |
| **RBAC** | Role-Based Access Control. Sistema de permissões baseado em papéis. |
| **Slug** | Identificador amigável para URLs (ex: `ipb-centro` em `ipb-centro.filadelfias.app`). |
| **Seed** | Script que popula o banco de dados com dados iniciais (ex: versículos da Bíblia). |
| **Use Case** | Camada de aplicação que orquestra uma ação de negócio específica. |
| **Repository** | Interface que abstrai o acesso a dados persistentes. |
| **DTO** | Data Transfer Object. Estrutura usada para transferir dados entre camadas. |
| **Zod Schema** | Definição de tipo/validação compartilhada entre frontend e backend. |
| **JWT** | JSON Web Token. Formato de token usado para autenticação stateless. |
| **Check-in** | Registro de presença em um evento ou culto. |
| **Roster** | Escala de serviço para um ministério específico. |

---

## 🔄 Mapeamento Domínio ↔ Código

| Conceito de Negócio | Entidade no Banco | Módulo do Sistema |
|---------------------|-------------------|-------------------|
| Igreja | `tenants` | `tenants` |
| Membro | `users` + `user_church_memberships` + `member_profiles` | `members` |
| Culto | `events` (type=WORSHIP) | `events` |
| Boletim | `bulletins` | `bulletins` |
| Pedido de Oração | `prayer_requests` | `prayer` |
| Hino | `songs` | `hymnal` |
| Versículo | `bible_verses` | `bible` |
| Presbítero | Role `ELDER` em `user_church_memberships` | `rbac` |
| Diácono | Role `DEACON` em `user_church_memberships` | `rbac` |
| Tesoureiro | Role `TREASURER` em `user_church_memberships` | `rbac` |
| Escala | `rosters` + `roster_slots` | `rosters` |
| Classe da EBD | `ebd_classes` | `ebd` |
| Eleição | `elections` + `candidates` + `votes` | `voting` |
| Ata | `minutes` | `minutes` |
| Lançamento Financeiro | `ledger_entries` | `treasury` |
