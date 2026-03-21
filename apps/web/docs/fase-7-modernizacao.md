# Fase 7: Modernização Web

## Escopo implementado agora

- baseline PWA no Vite com `vite-plugin-pwa`
- registro automático de service worker com aviso de atualização
- UX básica de offline e de instalação do app
- boundaries granulares de `Suspense` e `ErrorBoundary` por área/rota
- convenção inicial de separação `data` e `client` em `features/members`
- gestão centralizada de metadata por rota

## Convenções para preparação de Server Components

### `features/*/data`

Responsável por fetch puro e reutilizável, sem estado de interface.

Exemplo:

- `src/features/members/data/members.data.ts`

Esse formato permite reaproveitar a mesma função em:

- hooks com React Query
- loaders futuros
- Server Components caso o frontend migre para App Router

### `features/*/client`

Responsável por wrappers com estado local, modais, interações e efeitos.

Exemplo inicial:

- `src/features/members/client/MembersPageClient.tsx`

### `features/*/components`

Mantém componentes de apresentação, preferencialmente desacoplados de fetch.

## Estratégia de migração futura para Next.js

### O que já ajuda

- metadata centralizada por rota
- boundaries menores de carregamento/erro
- separação inicial entre fetch e client state
- PWA já compatível com uma futura porta de entrada App Router

### Próximos passos recomendados

1. mover gradualmente o fetch de outros domínios para `features/*/data`
2. reduzir dependência de hooks diretamente nas páginas de rota
3. separar wrappers client para `financial`, `missions`, `governance`
4. decidir se a migração para Next.js é motivada por SSR/SEO ou por arquitetura

## Observações

- React 19 já estava instalado no projeto antes desta fase.
- `use`, `useOptimistic` e form actions ainda precisam de adoção funcional por fluxo, não só por compatibilidade de versão.
- background sync ficou fora deste recorte inicial.
