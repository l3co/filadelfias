# Kubernetes — Manifestos e Configuração

**Infraestrutura:** Homelab K3s  
**Namespace:** `filadelfias`  
**GitOps:** Fleet

---

## 📋 Recursos Kubernetes

### Namespace
```yaml
# k8s/homelab/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: filadelfias
```

---

## ConfigMap

Variáveis de ambiente compartilhadas entre pods:

```yaml
# k8s/homelab/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: filadelfias-config
  namespace: filadelfias
data:
  ENVIRONMENT: "production"
  DEBUG: "false"
  PORT: "8000"
  POSTGRES_DB: "filadelfias"
  POSTGRES_HOST: "postgres"
  POSTGRES_PORT: "5432"
  POSTGRES_USER: "filadelfias"
  API_URL: "https://api.filadelfias.com"
  FRONTEND_URL: "https://filadelfias.com"
  CORS_ORIGINS_STR: "https://filadelfias.com"
```

**Uso:**
- Backend e Web injetam essas variáveis via `envFrom` ou `env`
- Permite atualizar configuração sem rebuild de imagens

---

## Secrets

**⚠️ Nunca commitar secrets no Git**

Template em `k8s/homelab/secrets.yaml.example`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: filadelfias-secrets
  namespace: filadelfias
type: Opaque
stringData:
  POSTGRES_PASSWORD: "sua-senha-segura"
  SECRET_KEY: "sua-chave-jwt-256-bits"
```

Criar manualmente:
```bash
kubectl create secret generic filadelfias-secrets \
  --from-literal=POSTGRES_PASSWORD='senha-forte' \
  --from-literal=SECRET_KEY='chave-jwt-256-bits' \
  -n filadelfias
```

Para imagens privadas do GHCR:
```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=SEU_GITHUB_USER \
  --docker-password=SEU_GITHUB_TOKEN \
  -n filadelfias
```

Para o túnel Cloudflare Zero Trust:
```bash
kubectl create secret generic cloudflare-tunnel-secret \
  --from-literal=token='<TOKEN_DO_TUNNEL>' \
  -n filadelfias
```

---

## PostgreSQL (StatefulSet)

```yaml
# k8s/homelab/postgres.yaml (simplificado)
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: filadelfias
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          env:
            - name: POSTGRES_DB
              valueFrom:
                configMapKeyRef:
                  name: filadelfias-config
                  key: POSTGRES_DB
            - name: POSTGRES_USER
              valueFrom:
                configMapKeyRef:
                  name: filadelfias-config
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: filadelfias-secrets
                  key: POSTGRES_PASSWORD
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

**Service:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: filadelfias
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
```

**DNS interno:** `postgres.filadelfias.svc.cluster.local` (ou simplesmente `postgres`)

---

## Cloudflare Zero Trust Tunnel

O cluster do `filadelfias` pode ser exposto sem abrir portas no host usando `cloudflared` como conector outbound.

### Manifesto do conector

Arquivo: `k8s/homelab/cloudflared.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloudflared
  namespace: filadelfias
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: cloudflared
          image: cloudflare/cloudflared:latest
          args:
            - tunnel
            - --no-autoupdate
            - run
            - --token
            - $(TUNNEL_TOKEN)
          env:
            - name: TUNNEL_TOKEN
              valueFrom:
                secretKeyRef:
                  name: cloudflare-tunnel-secret
                  key: token
```

### Public Hostnames

No dashboard do Cloudflare Zero Trust, configure os hostnames públicos apontando para os DNS internos do Kubernetes:

| Hostname público | URL do serviço no tunnel |
| --- | --- |
| `filadelfias.com` | `http://web.filadelfias.svc.cluster.local:8080` |
| `app.filadelfias.com` | `http://web.filadelfias.svc.cluster.local:8080` |
| `api.filadelfias.com` | `http://backend.filadelfias.svc.cluster.local:8000` |

O formato é sempre:

`http://<service>.<namespace>.svc.cluster.local:<port>`

### DNS conflitante

Se o dashboard mostrar:

`An A, AAAA, or CNAME record with that host already exists`

remova antes o registro conflitante em Cloudflare DNS. O tunnel vai criar automaticamente o CNAME para `<uuid>.cfargotunnel.com`.

### NetworkPolicy

Arquivos adicionados:

- `k8s/homelab/network-policies.yaml`

Políticas incluídas:

- `default-deny-ingress`
- `allow-cloudflared-to-web`
- `allow-cloudflared-to-backend`
- `allow-backend-to-postgres`

Essas regras assumem que o CNI do cluster suporta `NetworkPolicy`. Em K3s com Flannel padrão, isso pode ser ignorado silenciosamente até que você instale um provider compatível, como Calico ou Cilium.

### Checklist

- Criar o tunnel em Cloudflare Zero Trust
- Copiar o token em `Networks -> Tunnels -> <tunnel> -> Configure -> Install connector`
- Criar o secret `cloudflare-tunnel-secret`
- Aplicar `k8s/homelab/cloudflared.yaml`
- Configurar os Public Hostnames com `*.svc.cluster.local`
- Verificar registros DNS conflitantes
- Confirmar se o CNI suporta `NetworkPolicy`

---

## Backend (Deployment)

```yaml
# k8s/homelab/backend.yaml (simplificado)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: filadelfias
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: backend
          image: ghcr.io/l3co/filadelfias-backend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 8000
          envFrom:
            - configMapRef:
                name: filadelfias-config
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: filadelfias-secrets
                  key: POSTGRES_PASSWORD
            - name: SECRET_KEY
              valueFrom:
                secretKeyRef:
                  name: filadelfias-secrets
                  key: SECRET_KEY
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 15
```

**Service:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: filadelfias
spec:
  selector:
    app: backend
  ports:
    - port: 8000
      targetPort: 8000
```

---

## Web (Deployment)

```yaml
# k8s/homelab/web.yaml (simplificado)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: filadelfias
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: web
          image: ghcr.io/l3co/filadelfias-web:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 8080
          env:
            - name: API_URL
              valueFrom:
                configMapKeyRef:
                  name: filadelfias-config
                  key: API_URL
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
```

**Service:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: filadelfias
spec:
  selector:
    app: web
  ports:
    - port: 8080
      targetPort: 8080
```

---

## Migration Job

Job executado manualmente para aplicar migrações do banco:

```yaml
# k8s/homelab/migrate-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: migrate-db
  namespace: filadelfias
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: ghcr.io/l3co/filadelfias-backend:latest
          command: ["poetry", "run", "alembic", "upgrade", "head"]
          envFrom:
            - configMapRef:
                name: filadelfias-config
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: filadelfias-secrets
                  key: POSTGRES_PASSWORD
```

**Executar:**
```bash
kubectl apply -f k8s/homelab/migrate-job.yaml
kubectl -n filadelfias logs job/migrate-db
```

---

## Kustomization

Orquestra todos os recursos:

```yaml
# k8s/homelab/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: filadelfias

resources:
  - namespace.yaml
  - configmap.yaml
  - postgres.yaml
  - migrate-job.yaml
  - backend.yaml
  - web.yaml

images:
  - name: ghcr.io/l3co/filadelfias-backend
    newName: ghcr.io/l3co/filadelfias-backend
    newTag: latest
  - name: ghcr.io/l3co/filadelfias-web
    newName: ghcr.io/l3co/filadelfias-web
    newTag: latest
```

**Aplicar tudo:**
```bash
kubectl apply -k k8s/homelab/
```

---

## Fleet GitOps

O Fleet monitora o repositório e aplica automaticamente mudanças.

```yaml
# fleet.yaml (raiz do projeto)
defaultNamespace: filadelfias

kustomize:
  dir: k8s/homelab
```

**Fluxo:**
1. Push em `main` → GitHub
2. Fleet detecta mudança em `k8s/homelab/`
3. Fleet executa `kubectl apply -k k8s/homelab/`
4. Cluster atualizado automaticamente

---

## Health Checks

Todos os deployments possuem:

### Readiness Probe
Determina se o pod está pronto para receber tráfego
- Backend: `GET /health`
- Web: `GET /health`

### Liveness Probe
Determina se o pod precisa ser reiniciado
- Mesmo endpoint que readiness
- `initialDelaySeconds` maior para evitar restart prematuro

---

## Resource Limits

**Backend:**
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**Web:**
```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "50m"
  limits:
    memory: "256Mi"
    cpu: "250m"
```

**PostgreSQL:**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

---

## Estratégias de Deploy

### Rolling Update (padrão)
```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
```

- Zero downtime
- Atualiza um pod por vez
- Rollback automático se health check falhar

---

## Comandos Úteis

### Verificar status
```bash
kubectl -n filadelfias get all
kubectl -n filadelfias get pods -w  # watch
```

### Logs
```bash
kubectl -n filadelfias logs -f deployment/backend
kubectl -n filadelfias logs -f deployment/web
kubectl -n filadelfias logs -f statefulset/postgres
```

### Escalar manualmente
```bash
kubectl -n filadelfias scale deployment/backend --replicas=2
```

### Port-forward para debug
```bash
kubectl -n filadelfias port-forward svc/backend 8000:8000
kubectl -n filadelfias port-forward svc/postgres 5432:5432
```

### Executar comando dentro do pod
```bash
kubectl -n filadelfias exec -it deployment/backend -- /bin/sh
```

### Deletar recursos
```bash
kubectl delete -k k8s/homelab/
```

---

## Troubleshooting

### Pod em CrashLoopBackOff
```bash
kubectl -n filadelfias describe pod <pod-name>
kubectl -n filadelfias logs <pod-name> --previous
```

### ImagePullBackOff
- Verificar se ghcr-secret existe
- Verificar permissões no GitHub Container Registry
- Confirmar que imagem foi publicada

### Pending (não scheduled)
- Verificar recursos disponíveis no cluster
- Verificar PersistentVolumeClaim

### Conectividade entre pods
```bash
# Dentro de um pod
kubectl -n filadelfias exec -it deployment/backend -- sh
nc -zv postgres 5432
curl http://web:8080/health
```

---

**Referências:**
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize](https://kustomize.io/)
- [K3s](https://docs.k3s.io/)
