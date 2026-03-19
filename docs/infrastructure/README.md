# Infraestrutura — Documentação

Documentação sobre a infraestrutura Homelab do Filadelfias.

---

## 📂 Documentos

| Arquivo | Descrição |
|---------|-----------|
| [homelab.md](homelab.md) | Visão geral do Homelab: K3s, Cloudflare, GitOps |
| [kubernetes.md](kubernetes.md) | Manifestos K8s, recursos, troubleshooting |
| [ci-cd.md](ci-cd.md) | Pipeline GitHub Actions + Fleet |

---

## 🚀 Quick Links

**Produção:**
- Web: https://filadelfias.com
- API: https://api.filadelfias.com

**Comandos úteis:**
```bash
# Ver status dos pods
kubectl -n filadelfias get pods

# Ver logs
kubectl -n filadelfias logs -f deployment/backend

# Reiniciar deployment
kubectl -n filadelfias rollout restart deployment/web
```
