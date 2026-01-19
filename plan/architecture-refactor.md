# Refatoração Arquitetural - Fluxo de Cadastro

> **Objetivo**: Corrigir o fluxo de cadastro para que igrejas sejam cadastradas primeiro, com um administrador, e membros sejam cadastrados pelo admin (não auto-cadastro).

---

## 📋 Decisões Tomadas

- **Denominação**: Apenas IPB (Igreja Presbiteriana do Brasil)
- **Campos adicionais Member**: Não há campos específicos além dos propostos
- **Email**: Resend será usado para envio de emails
- **Endereço**: ViaCEP para auto-preenchimento pelo CEP

---

## 🎯 Novo Fluxo

### Wizard de Criação de Igreja (4 steps)

| Step | Campos |
|------|--------|
| **1. Igreja** | Nome, Slug, Logo (opcional) |
| **2. Endereço** | CEP → auto-preenche, Rua, Número, Complemento, Bairro, Cidade, Estado |
| **3. Admin** | Nome, Email, Senha, Telefone |
| **4. Confirmação** | Resumo + Termos |

### Fluxo de Acesso

1. Admin cadastra Member na igreja
2. Admin pode "Convidar para plataforma" → cria User + envia email
3. Membro recebe email → define senha → acessa

---

## 🗃️ Alterações nos Modelos

### Tenant (novos campos)
```python
street: str | None
number: str | None
complement: str | None
neighborhood: str | None
city: str | None
state: str | None  # UF (2 chars)
postal_code: str | None  # CEP
country: str = "Brasil"
phone: str | None
email: str | None
```

### Member (novos campos)
```python
marriage_date: date | None
spouse_name: str | None
profession_of_faith_date: date | None
admission_date: date | None
admission_type: str | None  # PROFISSAO_FE, TRANSFERENCIA, JURISDICAO
origin_church: str | None
```

---

## ✅ Checklist

### Backend
- [ ] Migration: campos de endereço em `tenants`
- [ ] Migration: campos adicionais em `members`
- [ ] Schema: `ChurchRegistrationRequest`
- [ ] Endpoint: `POST /churches/register`
- [ ] Endpoint: `POST /tenants/{id}/members/{id}/invite` (futuro)

### Frontend
- [ ] `ChurchRegistrationWizard.tsx` (substituir RegisterPage)
- [ ] Atualizar `LoginPage.tsx` (remover cadastre-se)
- [ ] Hook `useViaCEP` para auto-preenchimento
- [ ] Atualizar formulário de Member
