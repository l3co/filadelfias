# Documentação Deprecada

Este diretório contém documentação histórica que **não reflete mais a arquitetura atual** do projeto.

---

## ⚠️ Aviso

Os documentos aqui são mantidos apenas para **referência histórica** e **aprendizado**.

**Não use** estas informações para configurar ou entender o sistema atual.

---

## 📂 Arquivos Deprecados

### `planejamento-firebase.md`

**Status:** ❌ Obsoleto desde Março/2026

**Contexto histórico:**
- Planejamento original de migração do PostgreSQL (Digital Ocean) para Firebase/Firestore
- Documentava uso de Firebase Hosting, Cloud Run, Firestore, Firebase Auth
- Plano de 5 fases nunca executado

**Por que foi deprecado:**
- Optamos por **Homelab K3s** ao invés de Firebase/GCP
- Razões: controle total, custo zero, aprendizado de infraestrutura
- PostgreSQL + Kubernetes + Cloudflare se mostrou mais adequado

**Documentação atual:**
- [Homelab](../infrastructure/homelab.md) — Infraestrutura real
- [Kubernetes](../infrastructure/kubernetes.md) — Manifestos K8s
- [CI/CD](../infrastructure/ci-cd.md) — Pipeline de deploy

---

## 🔍 Por que mantemos isso?

1. **Histórico de decisões** — Documenta o processo de pensamento
2. **Aprendizado** — Mostra diferentes abordagens avaliadas
3. **Contexto** — Explica por que escolhemos a arquitetura atual

---

**Se você está configurando o ambiente, ignore este diretório e consulte `/docs/infrastructure/`**
