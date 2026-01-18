# UX Plan — Web Application
## 🎯 Princípios de Design & Componentes (Shadcn/UI Base)

Este documento define o comportamento e layout da versão **WEB (Desktop/Tablet)**.

### 🎨 Paleta de Cores & Tokens
Utilizaremos `TailwindCSS` com variáveis CSS.
*   **Background**: `bg-mint-50` (#DEEFE7) - Suave, não cansa a vista.
*   **Primary**: `text-navy-900` (#002333) - Elegante, para títulos e leituras longas.
*   **Accent**: `bg-teal-500` (#159A9C) - Ações principais, botões, destaques.
*   **Surface**: `bg-white` (#FFFFFF) - Cartões e áreas de conteúdo.

---

## 🏠 Dashboard (Home Logada)
**Objetivo**: Acesso rápido aos 3 pilares sem rolagem excessiva.

### Layout (Grid System)
*   **Container Fluido com Limite**: `max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8`.
    *   *Justificativa*: Em telas ultrawide, o conteúdo não deve "explodir", mas em laptops comuns deve aproveitar o espaço.

### Header e Role Switcher
O Header não é apenas navegação, é o ponto de controle do contexto do usuário.

*   **Lado Direito (User Area)**:
    *   **Avatar**: Ao clicar, abre um `DropdownMenu`.
    *   **Role Switcher (Item Crítico)**:
        *   Se o usuário tem roles especiais (ex: `Presbítero`, `Tesoureiro`), aparece um toggle destacado ou uma lista de perfis:
            *   `👁️ Visualizar como Membro` (Padrão)
            *   `🛠️ Painel Administrativo` (Muda a UI radicalmente para tabelas/gestão)
        *   *UX Note*: A troca deve ser instantânea (Client-side route), sem recarregar a página inteira, apenas remontando o layout.

### Grid Principal (Dashboard View)
A tela se divide não apenas em colunas, mas em "zonas de atenção".

#### 1. Zona de Inspiração (Versículo do Dia) - Coluna Esq (30%)
*   **Componente**: `DailyVerseCard`.
*   **Estrutura Interna**:
    *   `CardHeader`: Gradiente sutil `bg-gradient-to-r from-teal-500 to-teal-600` com ícone de Sol.
    *   `CardContent`: Texto serifado grande (`text-2xl leading-relaxed`).
    *   `CardFooter`: Botões de ação rápida (Copiar, Compartilhar) que aparecem apenas no hover (reduz ruído visual).

#### 2. Zona de Navegação (Os Pilares) - Coluna Dir (70%)
*   **Componente**: `FeatureCardGroup`.
*   **Visual do Card**:
    *   Uso de **Glassmorphism** leve sobre o fundo branco para dar modernidade.
    *   **Micro-interação**: Ao passar o mouse, o ícone (ex: Bíblia) escala 1.1x e muda de tom. O fundo do card ganha um leve brilho (`ring-2 ring-teal-100`).
    *   **Tamanho do Alvo**: O card inteiro é clicável (Link overlay), não apenas o texto.

#### 3. Área "Minha Igreja" (Abaixo do Grid Principal)
*   Seção transversal completa.
*   **Carrossel ou Grid de Avisos**: Próximos eventos, aniversariantes.

---

## 📖 Leitor da Bíblia (Web)
**Objetivo**: Imersão na leitura, sem distrações.

### Layout de Leitura
*   **Sidebar Esquerda (Retrátil)**: Seletor de Livros/Capítulos.
*   **Área Central (Texto)**:
    *   Largura controlada (`prose-lg` do Tailwind Typography) para não cansar o olho (aprox 65-75 caracteres por linha).
    *   **Fonte**: Serifada, tamanho ajustável pelo usuário (16px a 24px).
    *   **Fundo**: Opção de Sépia ou Dark Mode para leitura noturna.
*   **Sidebar Direita (Contexto)**:
    *   Notas pessoais.
    *   Referências cruzadas (ao clicar num versículo).

---

## 🎼 Hinário (Web)
### Lista de Hinos
*   **Tabela rica (shadcn Table)**:
    *   Colunas: Número, Título, Autor (opcional), Play (botão rápido).
    *   Filtro de busca instantâneo no topo.
*   **Detalhe do Hino**:
    *   Letra centralizada ou alinhada à esquerda (configurável).
    *   Player de áudio fixo no rodapé (sticky footer) quando der play.

---

## 🗳️ Painel de Votação (Assembleia Presencial)
*   **Bloqueio de UI**: Se o usuário não estiver no local (Geo/Token), exibir "Votação indisponível fora do local".
*   **Feedback Visual**:
    *   Ao votar, confirmação clara ("Seu voto foi registrado").
    *   Animação suave de sucesso.
