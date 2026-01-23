# Planejamento: Reuniões de Governança

## Visão Geral

Implementar funcionalidade completa de reuniões para os órgãos de governança (Conselho/Sessão, Junta Diaconal, Assembleias, Comissões) seguindo os princípios do Manual Presbiteriano.

### Contexto Presbiteriano

No sistema presbiteriano, as reuniões dos conselhos são fundamentais para:
- **Deliberações** - Decisões sobre a vida da igreja
- **Disciplina** - Casos de disciplina eclesiástica
- **Administração** - Gestão de recursos e atividades
- **Registro** - Atas oficiais para histórico e prestação de contas

---

## Estado Atual

### Backend ✅ Parcialmente Implementado
- `POST /governance/meetings` - Criar reunião
- `GET /governance/councils/{council_id}/meetings` - Listar reuniões

### Schema Atual
```python
MeetingResponse:
  - id: UUID
  - council_id: UUID
  - date: datetime
  - status: str = "SCHEDULED"
  - agenda: str (pauta)
  - location: str (local)
  - created_at: datetime
```

### Frontend ❌ Não Implementado
- Dialog mostra apenas placeholder "Funcionalidade em desenvolvimento"

---

## Requisitos Funcionais

### RF01 - Listagem de Reuniões
- [ ] Exibir todas as reuniões do conselho
- [ ] Separar por status (futuras/passadas)
- [ ] Indicador visual de timeline
- [ ] Ordenação por data (mais recente primeiro)

### RF02 - Criação de Reunião
- [ ] Formulário com: data, hora, local, pauta
- [ ] Tipo: Ordinária ou Extraordinária
- [ ] Convocação automática (opcional - fase 2)

### RF03 - Registro de Presença
- [ ] Lista de membros do conselho
- [ ] Marcar presentes/ausentes
- [ ] Justificativa de ausência

### RF04 - Ata da Reunião
- [ ] Editor de texto para ata
- [ ] Seções: Abertura, Pauta, Deliberações, Encerramento
- [ ] Registro de decisões tomadas
- [ ] Anexar documentos (fase 2)

### RF05 - Finalização
- [ ] Marcar reunião como realizada
- [ ] Bloquear edição após finalização
- [ ] Gerar PDF da ata (fase 2)

---

## Fases de Implementação

### Fase 1: MVP (Essencial) ⏱️ ~4-6h

#### 1.1 Backend - Expandir Schema
```python
# Novos campos em MeetingResponse
minutes: Optional[str] = None          # Ata/notas
attendees: list[str] = []              # IDs dos presentes
meeting_type: str = "ORDINARY"         # ORDINARY | EXTRAORDINARY
completed_at: Optional[datetime] = None
```

**Tarefas:**
- [ ] Atualizar `MeetingBase` e `MeetingResponse` em `schemas.py`
- [ ] Atualizar `MeetingRepository` com novos métodos
- [ ] Adicionar endpoints: `PATCH /meetings/{id}`, `GET /meetings/{id}`

#### 1.2 Backend - Novos Endpoints
- [ ] `PATCH /governance/meetings/{meeting_id}` - Atualizar reunião
- [ ] `POST /governance/meetings/{meeting_id}/complete` - Finalizar reunião

#### 1.3 Frontend - Componentes
- [ ] `MeetingsDialog.tsx` - Dialog expandido com listagem real
- [ ] `MeetingCard.tsx` - Card individual de reunião
- [ ] `CreateMeetingDialog.tsx` - Formulário de criação
- [ ] `MeetingDetailsDialog.tsx` - Detalhes e edição de ata

#### 1.4 Frontend - Hooks
- [ ] `useMeetings(councilId)` - Query para listar
- [ ] `useCreateMeeting()` - Mutation para criar
- [ ] `useUpdateMeeting()` - Mutation para atualizar

---

### Fase 2: Melhorias (~2-3h)

- [ ] Upload de anexos (PDF, imagens)
- [ ] Exportar ata em PDF
- [ ] Notificações de convocação
- [ ] Histórico de alterações

---

### Fase 3: Avançado (Futuro)

- [ ] Assinatura digital dos participantes
- [ ] Integração com calendário (Google Calendar)
- [ ] Votações registradas
- [ ] Relatórios estatísticos

---

## Estrutura de Arquivos

```
apps/
├── backend/src/
│   ├── api/governance.py                    # Endpoints (atualizar)
│   └── modules/governance/
│       ├── schemas.py                       # Schemas (atualizar)
│       └── repository.py                    # Repository (atualizar)
│
└── web/src/features/governance/
    ├── components/
    │   ├── MeetingsDialog.tsx              # CRIAR
    │   ├── MeetingCard.tsx                 # CRIAR
    │   ├── CreateMeetingDialog.tsx         # CRIAR
    │   └── MeetingDetailsDialog.tsx        # CRIAR
    └── hooks/
        └── useGovernance.ts                # Adicionar hooks de meetings
```

---

## Status dos Valores

```typescript
enum MeetingStatus {
  SCHEDULED = "SCHEDULED",     // Agendada
  IN_PROGRESS = "IN_PROGRESS", // Em andamento (opcional)
  COMPLETED = "COMPLETED",     // Realizada
  CANCELLED = "CANCELLED"      // Cancelada
}

enum MeetingType {
  ORDINARY = "ORDINARY",           // Ordinária (regular)
  EXTRAORDINARY = "EXTRAORDINARY"  // Extraordinária (especial)
}
```

---

## Mockup Visual

```
┌─────────────────────────────────────────────────────────┐
│  Reuniões - Conselho                              [+ Nova] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📅 PRÓXIMAS REUNIÕES                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🟢 Reunião Ordinária                            │   │
│  │    15/02/2026 às 19:30 • Salão da Igreja       │   │
│  │    Pauta: Planejamento anual                   │   │
│  │                                    [Ver] [Editar]│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📋 REUNIÕES REALIZADAS                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅ Reunião Ordinária                    10/01   │   │
│  │    Presentes: 5/6 • Ata registrada             │   │
│  │                                    [Ver Ata]    │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅ Reunião Extraordinária               05/01   │   │
│  │    Presentes: 6/6 • Ata registrada             │   │
│  │                                    [Ver Ata]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Checklist de Implementação

### Backend
- [ ] Expandir `MeetingBase` com novos campos
- [ ] Expandir `MeetingResponse` com novos campos
- [ ] Adicionar `MeetingUpdate` schema
- [ ] Implementar `update_meeting` no repository
- [ ] Implementar `get_meeting_by_id` no repository
- [ ] Adicionar endpoint `PATCH /governance/meetings/{id}`
- [ ] Adicionar endpoint `POST /governance/meetings/{id}/complete`
- [ ] Testes unitários (opcional)

### Frontend
- [ ] Criar `MeetingCard.tsx`
- [ ] Criar `MeetingsDialog.tsx` com listagem real
- [ ] Criar `CreateMeetingDialog.tsx`
- [ ] Criar `MeetingDetailsDialog.tsx`
- [ ] Adicionar `useMeetings` hook
- [ ] Adicionar `useCreateMeeting` hook
- [ ] Adicionar `useUpdateMeeting` hook
- [ ] Integrar com `CouncilList.tsx`
- [ ] Testes E2E (opcional)

---

## Critérios de Aceite

1. ✅ Usuário pode criar uma nova reunião com data, local e pauta
2. ✅ Reuniões futuras aparecem destacadas
3. ✅ Reuniões passadas mostram indicador visual diferente
4. ✅ Usuário pode registrar ata após a reunião
5. ✅ Usuário pode marcar presença dos membros
6. ✅ Usuário pode visualizar histórico de reuniões
7. ✅ Apenas Pastor/Presbítero podem criar/editar reuniões

---

## Próximos Passos

1. **Iniciar pela Fase 1.1** - Expandir backend (schema + repository)
2. **Depois Fase 1.2** - Novos endpoints
3. **Por fim Fase 1.3/1.4** - Frontend completo

Deseja iniciar a implementação?
