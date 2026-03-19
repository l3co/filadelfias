# Planejamento: Manual Presbiteriano 2019

## 📋 Visão Geral

Implementar uma funcionalidade para exibição do Manual Presbiteriano de 2019 na aplicação web, permitindo navegação hierárquica, leitura de artigos e busca.

---

## 📊 Análise do JSON

### Estrutura do Arquivo
- **Localização**: `apps/backend/src/assets/manual_2019.json`
- **Tamanho**: ~28.400 linhas
- **Schema Version**: 1.0.0

### Hierarquia de Dados
```
metadata
└── parts[]
    └── items[] (chapters)
        └── items[] (sections)
            └── items[] (articles)
                ├── text
                ├── structure[]
                └── notes[]
```

### Tipos de Elementos
| Tipo | Descrição |
|------|-----------|
| `part` | Parte principal do manual |
| `chapter` | Capítulo (ex: "I – NATUREZA, GOVERNO E FINS DA IGREJA") |
| `section` | Seção dentro de capítulo (ex: "Seção 1ª – Classificação...") |
| `article` | Artigo com texto completo e notas de rodapé |

### Campos dos Artigos
- `id`: Identificador único (ex: "manual/chI/art1")
- `number`: Número do artigo
- `text`: Texto completo do artigo
- `structure[]`: Estrutura do texto (parágrafos, alíneas)
- `notes[]`: Notas de rodapé com referências

---

## 🎯 Funcionalidades Planejadas

### Fase 1: Backend API
- [ ] Criar endpoint GET `/manual/parts` - Lista todas as partes
- [ ] Criar endpoint GET `/manual/chapters` - Lista capítulos de uma parte
- [ ] Criar endpoint GET `/manual/article/:id` - Retorna artigo específico
- [ ] Criar endpoint GET `/manual/search?q=termo` - Busca em artigos
- [ ] Criar serviço para carregar e cachear o JSON

### Fase 2: Frontend - Estrutura Base
- [ ] Criar rota `/manual` na aplicação
- [ ] Criar página `ManualPage.tsx` - índice/sumário
- [ ] Criar página `ManualReaderPage.tsx` - leitura de artigos
- [ ] Criar serviço `manual.ts` com chamadas à API

### Fase 3: Frontend - Componentes
- [ ] `ManualSidebar` - Navegação hierárquica (partes > capítulos > seções)
- [ ] `ManualArticle` - Exibição do artigo com formatação
- [ ] `ManualNotes` - Notas de rodapé interativas
- [ ] `ManualSearch` - Campo de busca com autocomplete
- [ ] `ManualBreadcrumb` - Navegação de contexto

### Fase 4: UX/UI
- [ ] Design responsivo (mobile-first)
- [ ] Modo de leitura confortável (ajuste de fonte)
- [ ] Destacar termos buscados
- [ ] Navegação entre artigos (anterior/próximo)
- [ ] Favoritos/marcadores (opcional)

---

## 🏗️ Arquitetura Proposta

### Backend
```
apps/backend/src/
├── api/
│   └── manual.py          # Endpoints da API
├── services/
│   └── manual_service.py  # Lógica de negócio
└── assets/
    └── manual_2019.json   # Dados (já existe)
```

### Frontend
```
apps/web/src/
├── routes/
│   └── manual/
│       ├── ManualPage.tsx       # Índice/Sumário
│       └── ManualReaderPage.tsx # Leitura de artigos
├── features/
│   └── manual/
│       └── components/
│           ├── ManualSidebar.tsx
│           ├── ManualArticle.tsx
│           ├── ManualNotes.tsx
│           └── ManualSearch.tsx
└── services/
    └── manual.ts               # API client
```

---

## 📝 Definição de Endpoints

### GET /manual/structure
Retorna a estrutura completa do manual (sem texto dos artigos).
```json
{
  "metadata": { ... },
  "parts": [
    {
      "id": "manual_2019",
      "title": "Manual Presbiteriano 2019",
      "chapters": [
        {
          "id": "manual/chI",
          "number": "I",
          "title": "NATUREZA, GOVERNO E FINS DA IGREJA",
          "sections": [...]
        }
      ]
    }
  ]
}
```

### GET /manual/article/:id
Retorna um artigo específico com texto e notas.
```json
{
  "id": "manual/chI/art1",
  "number": "1",
  "text": "A Igreja Presbiteriana do Brasil...",
  "structure": [...],
  "notes": [...],
  "navigation": {
    "previous": "manual/chI/art0",
    "next": "manual/chI/art2"
  }
}
```

### GET /manual/search?q=termo
Busca artigos que contenham o termo.
```json
{
  "query": "batismo",
  "results": [
    {
      "id": "manual/chV/art45",
      "number": "45",
      "excerpt": "...O batismo é um sacramento...",
      "chapter": "V – BATISMO DE CRIANÇAS"
    }
  ]
}
```

---

## 🔧 Observações sobre o JSON

### Problemas Identificados
1. **IDs duplicados**: Alguns capítulos têm IDs repetidos (ex: "manual/chI" aparece várias vezes)
   - **Solução**: Gerar IDs únicos baseados na posição na hierarquia

2. **Títulos com números de página**: Alguns títulos incluem ".... 13"
   - **Solução**: Limpar títulos removendo números de página

3. **Estrutura não consistente**: Nem todos os capítulos têm seções ou artigos
   - **Solução**: Tratar casos vazios na UI

---

## ⏱️ Estimativa de Tempo

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| 1 | Backend API | 2-3 horas |
| 2 | Frontend Base | 2-3 horas |
| 3 | Componentes | 3-4 horas |
| 4 | UX/UI | 2-3 horas |
| **Total** | | **9-13 horas** |

---

## 🚀 Próximos Passos

1. **Iniciar pela Fase 1** - Criar API no backend
2. Testar endpoints com dados reais
3. Desenvolver frontend iterativamente
4. Revisar UX com usuário

---

## 📎 Referências

- JSON do Manual: `apps/backend/src/assets/manual_2019.json`
- Estrutura similar: Página da Bíblia (`/bible`)
- Design: Seguir padrão visual existente (Tailwind + shadcn/ui)
