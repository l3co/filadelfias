# Planejamento de Migração para Firebase

**Projeto:** Filadélfias  
**Data:** Janeiro 2026  
**Status:** Planejamento  

---

## 📋 Sumário Executivo

Este documento detalha o plano completo de migração do sistema Filadélfias da infraestrutura atual (Digital Ocean) para o ecossistema Firebase/Google Cloud Platform.

### Situação Atual
- **Frontend:** React + Vite → Digital Ocean App Platform
- **Backend:** FastAPI (Python) → Digital Ocean App Platform
- **Banco de Dados:** PostgreSQL → Digital Ocean Managed Database
- **CI/CD:** GitHub Actions

### Situação Futura
- **Frontend:** React + Vite → Firebase Hosting
- **Backend:** FastAPI (Python) → Cloud Run
- **Banco de Dados:** Firestore (NoSQL)
- **Autenticação:** Firebase Authentication
- **CI/CD:** GitHub Actions + Firebase CLI

---

## 🎯 Objetivos da Migração

1. **Custo Zero** - Utilizar free tier do Firebase/GCP
2. **Escalabilidade** - Preparar para crescimento futuro
3. **Simplicidade** - Reduzir complexidade operacional
4. **Performance** - CDN global do Firebase Hosting

---

## 📊 Análise de Impacto

### Componentes que NÃO precisam de alteração
| Componente | Razão |
|------------|-------|
| Bíblia Service | Dados estáticos em JSON |
| Hinário Service | Dados estáticos em JSON |
| Manual Service | Dados estáticos em JSON |
| Frontend React | Apenas configuração de deploy |

### Componentes que PRECISAM de alteração
| Componente | Tipo de Alteração | Esforço |
|------------|-------------------|---------|
| Autenticação | Migrar para Firebase Auth | Médio |
| Database Layer | SQLAlchemy → Firestore | Alto |
| Repositories | Reescrever queries | Alto |
| Models | Adaptar para NoSQL | Médio |
| API Endpoints | Ajustar para Cloud Run | Baixo |

---

## 🗓️ Cronograma de Fases

### FASE 1: Firebase Hosting (Frontend)
**Duração:** 1 dia  
**Risco:** Baixo  
**Dependências:** Nenhuma

#### Tarefas:
- [ ] 1.1 Criar projeto no Firebase Console
- [ ] 1.2 Instalar Firebase CLI
- [ ] 1.3 Configurar `firebase.json` para hosting
- [ ] 1.4 Configurar variáveis de ambiente para produção
- [ ] 1.5 Fazer primeiro deploy manual
- [ ] 1.6 Configurar domínio customizado (opcional)
- [ ] 1.7 Atualizar GitHub Actions para deploy automático

#### Arquivos a criar:
```
apps/web/
├── firebase.json
├── .firebaserc
└── firebase-hosting-pull-request.yml (GitHub Action)
```

#### Configuração firebase.json:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

### FASE 2: Cloud Run (Backend)
**Duração:** 2-3 dias  
**Risco:** Baixo  
**Dependências:** Fase 1

#### Tarefas:
- [ ] 2.1 Criar projeto no Google Cloud Console (ou usar mesmo do Firebase)
- [ ] 2.2 Habilitar Cloud Run API
- [ ] 2.3 Configurar Artifact Registry para imagens Docker
- [ ] 2.4 Adaptar Dockerfile para Cloud Run
- [ ] 2.5 Configurar variáveis de ambiente no Cloud Run
- [ ] 2.6 Fazer primeiro deploy manual
- [ ] 2.7 Configurar domínio customizado para API
- [ ] 2.8 Atualizar GitHub Actions para deploy automático
- [ ] 2.9 Atualizar frontend para apontar para nova URL da API

#### Dockerfile otimizado para Cloud Run:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ ./src/

# Cloud Run usa a variável PORT
ENV PORT=8080
EXPOSE 8080

# Usar gunicorn para produção
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 src.main:app -k uvicorn.workers.UvicornWorker
```

#### GitHub Action para Cloud Run:
```yaml
name: Deploy Backend to Cloud Run

on:
  push:
    branches: [main]
    paths:
      - 'apps/backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - uses: google-github-actions/setup-gcloud@v2
      
      - name: Build and Push
        run: |
          gcloud builds submit \
            --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/filadelfias-api \
            ./apps/backend
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy filadelfias-api \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/filadelfias-api \
            --platform managed \
            --region southamerica-east1 \
            --allow-unauthenticated
```

---

### FASE 3: Firebase Authentication
**Duração:** 3-4 dias  
**Risco:** Médio  
**Dependências:** Fase 2

#### Tarefas:
- [ ] 3.1 Habilitar Firebase Authentication no console
- [ ] 3.2 Configurar provedores (Email/Password, Google)
- [ ] 3.3 Instalar Firebase SDK no frontend
- [ ] 3.4 Criar contexto de autenticação React
- [ ] 3.5 Migrar telas de Login/Register para Firebase Auth
- [ ] 3.6 Instalar Firebase Admin SDK no backend
- [ ] 3.7 Criar middleware de verificação de token Firebase
- [ ] 3.8 Remover lógica de JWT próprio
- [ ] 3.9 Atualizar endpoints protegidos

#### Frontend - Contexto de Auth:
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getIdToken = async () => {
    return user ? await user.getIdToken() : null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### Backend - Middleware Firebase:
```python
# src/infra/firebase_auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, credentials, initialize_app

# Inicializar Firebase Admin
cred = credentials.Certificate("path/to/serviceAccountKey.json")
initialize_app(cred)

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Verifica token Firebase e retorna dados do usuário."""
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
```

---

### FASE 4: Migração para Firestore
**Duração:** 7-10 dias  
**Risco:** Alto  
**Dependências:** Fase 3

Esta é a fase mais complexa e requer redesenho da camada de dados.

#### 4.1 Estrutura do Firestore

```
firestore/
│
├── users/{firebaseUid}
│   ├── email: string
│   ├── name: string
│   ├── avatarUrl: string?
│   ├── createdAt: timestamp
│   └── memberships: [
│         { tenantId: string, role: string, joinedAt: timestamp }
│       ]
│
├── tenants/{tenantId}
│   ├── name: string
│   ├── slug: string (unique)
│   ├── logoUrl: string?
│   ├── address: {
│   │     street, number, complement, neighborhood,
│   │     city, state, postalCode, country
│   │   }
│   ├── location: geopoint?
│   ├── contact: { phone, email }
│   ├── isPublic: boolean
│   ├── config: map
│   ├── createdAt: timestamp
│   │
│   ├── members/{memberId}  (subcollection)
│   │   ├── userId: string? (ref to users)
│   │   ├── fullName: string
│   │   ├── email: string?
│   │   ├── phone: string?
│   │   ├── birthDate: timestamp?
│   │   ├── gender: string?
│   │   ├── maritalStatus: string?
│   │   ├── address: { ... }
│   │   ├── photoUrl: string?
│   │   ├── status: string (COMUNGANTE, NAO_COMUNGANTE, etc)
│   │   ├── office: string (MEMBRO, DIACONO, PRESBITERO, PASTOR)
│   │   ├── functions: array
│   │   ├── baptismDate: timestamp?
│   │   ├── professionOfFaithDate: timestamp?
│   │   ├── admissionDate: timestamp?
│   │   ├── admissionType: string?
│   │   ├── originChurch: string?
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│   ├── financial/
│   │   ├── accounts/{accountId}
│   │   │   ├── name: string
│   │   │   ├── type: string (BANK, CASH)
│   │   │   ├── balance: number
│   │   │   └── createdAt: timestamp
│   │   │
│   │   ├── categories/{categoryId}
│   │   │   ├── name: string
│   │   │   ├── type: string (INCOME, EXPENSE)
│   │   │   └── parentId: string?
│   │   │
│   │   └── transactions/{transactionId}
│   │       ├── accountId: string
│   │       ├── categoryId: string?
│   │       ├── memberId: string? (para dízimos)
│   │       ├── amount: number
│   │       ├── type: string (CREDIT, DEBIT)
│   │       ├── description: string
│   │       ├── date: timestamp
│   │       ├── attachmentUrl: string?
│   │       └── createdAt: timestamp
│   │
│   ├── ebd/
│   │   └── classes/{classId}
│   │       ├── name: string
│   │       ├── description: string?
│   │       ├── minAge: number?
│   │       ├── maxAge: number?
│   │       ├── location: string?
│   │       │
│   │       ├── students/{studentId}  (subcollection)
│   │       │   ├── memberId: string
│   │       │   ├── role: string (STUDENT, TEACHER)
│   │       │   └── enrolledAt: timestamp
│   │       │
│   │       └── lessons/{lessonId}  (subcollection)
│   │           ├── date: timestamp
│   │           ├── topic: string
│   │           ├── description: string?
│   │           └── homeworkUrl: string?
│   │
│   ├── governance/
│   │   └── councils/{councilId}
│   │       ├── name: string
│   │       ├── type: string (SESSION, DEACONS, ASSEMBLY, COMMITTEE)
│   │       ├── description: string?
│   │       ├── createdAt: timestamp
│   │       │
│   │       ├── members/{councilMemberId}  (subcollection)
│   │       │   ├── memberId: string
│   │       │   ├── role: string (PRESIDENT, SECRETARY, MEMBER)
│   │       │   ├── startDate: timestamp
│   │       │   └── endDate: timestamp?
│   │       │
│   │       └── meetings/{meetingId}  (subcollection)
│   │           ├── date: timestamp
│   │           ├── status: string
│   │           ├── agenda: string?
│   │           ├── location: string?
│   │           ├── createdAt: timestamp
│   │           └── minute: {
│   │                 content: string,
│   │                 status: string,
│   │                 updatedAt: timestamp
│   │               }
│   │
│   └── missions/
│       └── missionaries/{missionaryId}
│           ├── memberId: string?
│           ├── name: string
│           ├── field: string
│           ├── organization: string?
│           ├── status: string
│           ├── startDate: timestamp?
│           ├── supportAmount: number?
│           └── createdAt: timestamp
│
└── invitations/{invitationId}
    ├── tenantId: string
    ├── email: string
    ├── role: string
    ├── invitedBy: string (userId)
    ├── status: string (PENDING, ACCEPTED, EXPIRED)
    ├── createdAt: timestamp
    └── expiresAt: timestamp
```

#### 4.2 Criar Camada de Abstração Firestore

```python
# src/infra/firestore.py
from google.cloud import firestore
from typing import Optional, List, Dict, Any
from datetime import datetime

db = firestore.Client()

class FirestoreRepository:
    """Base repository for Firestore operations."""
    
    def __init__(self, collection_path: str):
        self.collection_path = collection_path
    
    def _get_collection(self, tenant_id: Optional[str] = None):
        if tenant_id:
            return db.collection("tenants").document(tenant_id).collection(self.collection_path)
        return db.collection(self.collection_path)
    
    async def get_by_id(self, doc_id: str, tenant_id: Optional[str] = None) -> Optional[Dict]:
        doc = self._get_collection(tenant_id).document(doc_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None
    
    async def get_all(self, tenant_id: Optional[str] = None, **filters) -> List[Dict]:
        query = self._get_collection(tenant_id)
        
        for field, value in filters.items():
            query = query.where(field, "==", value)
        
        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results
    
    async def create(self, data: Dict, tenant_id: Optional[str] = None, doc_id: Optional[str] = None) -> str:
        data["createdAt"] = datetime.utcnow()
        
        if doc_id:
            self._get_collection(tenant_id).document(doc_id).set(data)
            return doc_id
        else:
            doc_ref = self._get_collection(tenant_id).add(data)
            return doc_ref[1].id
    
    async def update(self, doc_id: str, data: Dict, tenant_id: Optional[str] = None) -> bool:
        data["updatedAt"] = datetime.utcnow()
        self._get_collection(tenant_id).document(doc_id).update(data)
        return True
    
    async def delete(self, doc_id: str, tenant_id: Optional[str] = None) -> bool:
        self._get_collection(tenant_id).document(doc_id).delete()
        return True
```

#### 4.3 Migrar Repositories

Exemplo de migração do MemberRepository:

**Antes (SQLAlchemy):**
```python
class MemberRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_by_tenant(self, tenant_id: UUID) -> List[Member]:
        result = await self.session.execute(
            select(Member).where(Member.tenant_id == tenant_id)
        )
        return result.scalars().all()
```

**Depois (Firestore):**
```python
class MemberRepository(FirestoreRepository):
    def __init__(self):
        super().__init__("members")
    
    async def get_by_tenant(self, tenant_id: str) -> List[Dict]:
        return await self.get_all(tenant_id=tenant_id)
    
    async def get_by_office(self, tenant_id: str, office: str) -> List[Dict]:
        return await self.get_all(tenant_id=tenant_id, office=office)
```

#### 4.4 Tarefas da Fase 4

- [ ] 4.1 Habilitar Firestore no Firebase Console
- [ ] 4.2 Configurar regras de segurança do Firestore
- [ ] 4.3 Criar classe base `FirestoreRepository`
- [ ] 4.4 Migrar `MemberRepository`
- [ ] 4.5 Migrar `TenantRepository`
- [ ] 4.6 Migrar `FinancialRepository`
- [ ] 4.7 Migrar `EBDRepository`
- [ ] 4.8 Migrar `GovernanceRepository`
- [ ] 4.9 Migrar `MissionRepository`
- [ ] 4.10 Atualizar todos os Services para usar novos repositories
- [ ] 4.11 Atualizar todos os API endpoints
- [ ] 4.12 Remover dependências SQLAlchemy
- [ ] 4.13 Testar todas as funcionalidades
- [ ] 4.14 Criar índices compostos necessários no Firestore

#### 4.5 Regras de Segurança Firestore

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tenants - apenas membros podem acessar
    match /tenants/{tenantId} {
      allow read: if request.auth != null && isMemberOfTenant(tenantId);
      allow write: if request.auth != null && isAdminOfTenant(tenantId);
      
      // Subcollections herdam permissões
      match /{subcollection}/{docId} {
        allow read: if request.auth != null && isMemberOfTenant(tenantId);
        allow write: if request.auth != null && isAdminOfTenant(tenantId);
      }
      
      match /{subcollection}/{docId}/{subsubcollection}/{subDocId} {
        allow read: if request.auth != null && isMemberOfTenant(tenantId);
        allow write: if request.auth != null && isAdminOfTenant(tenantId);
      }
    }
    
    // Convites - qualquer autenticado pode ler seus convites
    match /invitations/{invitationId} {
      allow read: if request.auth != null && 
                    resource.data.email == request.auth.token.email;
      allow write: if false; // Apenas backend pode criar
    }
    
    // Funções auxiliares
    function isMemberOfTenant(tenantId) {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             tenantId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.memberships.keys();
    }
    
    function isAdminOfTenant(tenantId) {
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid));
      let membership = user.data.memberships[tenantId];
      return membership != null && membership.role in ['ADMIN', 'PASTOR', 'SECRETARY'];
    }
  }
}
```

---

### FASE 5: Limpeza e Finalização
**Duração:** 1-2 dias  
**Risco:** Baixo  
**Dependências:** Fase 4

#### Tarefas:
- [ ] 5.1 Remover código legado (SQLAlchemy, JWT próprio)
- [ ] 5.2 Remover dependências não utilizadas do requirements.txt
- [ ] 5.3 Atualizar documentação
- [ ] 5.4 Desativar recursos no Digital Ocean
- [ ] 5.5 Configurar alertas e monitoramento no Firebase
- [ ] 5.6 Configurar backups automáticos do Firestore
- [ ] 5.7 Testar fluxo completo end-to-end
- [ ] 5.8 Atualizar README com novas instruções

---

## 💰 Análise de Custos

### Free Tier do Firebase/GCP

| Serviço | Limite Gratuito | Uso Estimado |
|---------|-----------------|--------------|
| **Firebase Hosting** | 10 GB/mês transferência | ~1 GB/mês |
| **Cloud Run** | 2M requests/mês | ~10k requests/mês |
| **Firestore** | 50k leituras/dia | ~5k leituras/dia |
| **Firestore** | 20k escritas/dia | ~500 escritas/dia |
| **Firestore** | 1 GB armazenamento | ~100 MB |
| **Firebase Auth** | Ilimitado (email/password) | ✅ |

**Custo estimado mensal: $0** (dentro do free tier)

### Quando começaria a pagar?

| Cenário | Usuários | Custo Estimado |
|---------|----------|----------------|
| Atual (0 usuários) | 0 | $0 |
| 10 igrejas pequenas | ~500 | $0 |
| 50 igrejas médias | ~5.000 | ~$5-10/mês |
| 200 igrejas | ~20.000 | ~$20-50/mês |

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados na migração | Baixa | Alto | Não há dados para migrar |
| Incompatibilidade de queries | Média | Médio | Testar cada repository |
| Latência maior | Baixa | Baixo | Cloud Run em São Paulo |
| Vendor lock-in | Média | Médio | Manter abstração de repository |
| Complexidade NoSQL | Média | Médio | Documentar estrutura bem |

---

## 📝 Checklist Pré-Migração

- [x] Criar conta Google Cloud / Firebase ✅
- [x] Criar projeto no Firebase Console ✅ (Nome: **Filadelfias**)
- [ ] Configurar billing (mesmo para free tier)
- [ ] Gerar Service Account Key para CI/CD
- [ ] Configurar secrets no GitHub
- [ ] Fazer backup do código atual (tag no git)

---

## 🔧 Comandos Úteis

### Firebase CLI
```bash
# Instalar
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init

# Deploy hosting
firebase deploy --only hosting

# Deploy rules
firebase deploy --only firestore:rules
```

### Google Cloud CLI
```bash
# Instalar
brew install google-cloud-sdk

# Login
gcloud auth login

# Configurar projeto
gcloud config set project SEU_PROJETO_ID

# Deploy Cloud Run
gcloud run deploy filadelfias-api \
  --source ./apps/backend \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated
```

---

## 📅 Cronograma Resumido

| Fase | Duração | Acumulado |
|------|---------|-----------|
| Fase 1: Firebase Hosting | 1 dia | 1 dia |
| Fase 2: Cloud Run | 2-3 dias | 4 dias |
| Fase 3: Firebase Auth | 3-4 dias | 8 dias |
| Fase 4: Firestore | 7-10 dias | 18 dias |
| Fase 5: Limpeza | 1-2 dias | **20 dias** |

**Tempo total estimado: 3-4 semanas**

---

## ✅ Critérios de Sucesso

1. Frontend acessível via Firebase Hosting
2. Backend respondendo via Cloud Run
3. Autenticação funcionando com Firebase Auth
4. Todos os CRUDs funcionando com Firestore
5. CI/CD automatizado para todas as partes
6. Custo mensal = $0
7. Performance igual ou melhor que atual

---

## 📚 Referências

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Documento criado por:** Cascade AI  
**Última atualização:** Janeiro 2026
