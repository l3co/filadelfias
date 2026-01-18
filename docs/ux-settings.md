# Estratégia UX para Desktop: "Otimização do Espaço sem Poluição"

*   **Layout de Grade (Grid)**: Em vez de empilhar tudo verticalmente, usaremos o espaço horizontal para colocar elementos chave lado a lado, reduzindo a necessidade de rolagem (scroll) da página.
*   **Foco Visual**: Manteremos os "Três Pilares" (Bíblia, Hinário, Boletins) como os elementos maiores e mais chamativos da tela.
*   **Hover States (Estado ao passar o mouse)**: No desktop, temos o cursor. É crucial que, ao passar o mouse sobre um cartão, ele mude ligeiramente de cor ou se eleve. Isso dá um feedback visual importante para usuários menos experientes saberem que aquilo é clicável.

---

## Proposta Visual da Home Web Desktop (Wireframe Descritivo)

Imagine a tela do monitor. O fundo geral continua o suave **Menta Pálido #DEEFE7**. O conteúdo principal ficará centralizado em um contêiner de largura máxima (ex: `1200px`) para não ficar muito esticado em monitores gigantes.

### A. Barra Superior (Header) - Navegação Global
Uma barra limpa e fixa no topo para dar segurança.

*   **Fundo**: Branco (`#FFFFFF`) com uma sombra muito sutil na parte inferior para separá-lo do resto da página.
*   **Esquerda**: O nome do App/Igreja em **Azul Marinho Profundo #002333** (Ex: "Presbitério Digital").
*   **Direita**:
    *   *Se o usuário não estiver logado*: Um botão simples "Entrar" com contorno **Teal #159A9C**.
    *   *Se estiver logado*: Um texto de boas-vindas simples "Olá, [Nome]" e um ícone de engrenagem (configurações) discreto em **Cinza #B4BEC9**.
*   **UX Note**: Evitaremos menus complexos aqui. O foco da Home é a navegação principal abaixo.

### B. Área Principal: O Dashboard (O Coração da Tela)
Logo abaixo da barra superior, teremos uma área dividida em duas colunas principais, com proporção aproximada de **1/3 para a esquerda** e **2/3 para a direita**.

#### Coluna da Esquerda (1/3) - Inspiração e Contexto

**Cartão "Versículo do Dia" (Verticalizado)**:
*   Um cartão alto com fundo Branco (`#FFFFFF`).
*   Topo do cartão com uma faixa ou ícone grande na cor **Teal #159A9C** com o título "Palavra do Dia".
*   O texto do versículo em tamanho grande, fonte serifada elegante, em **Azul Marinho #002333**.
*   A referência bíblica abaixo em **Cinza #B4BEC9**.
*   *Por que aqui?* Ele serve como uma âncora visual de calma antes das ações principais.

#### Coluna da Direita (2/3) - Navegação Principal (Os Três Pilares)
Aqui, em vez de empilhados, os três cartões principais estarão alinhados horizontalmente em uma linha. Eles devem ser grandes, quadrados e dominantes na tela.

1.  **Cartão 1 (Esquerda)**: Bíblia Sagrada
2.  **Cartão 2 (Meio)**: Hinário
3.  **Cartão 3 (Direita)**: Boletins

**Visual dos Cartões de Navegação**:
*   Fundo Branco (`#FFFFFF`), cantos arredondados, sombra suave.
*   **Ícone Gigante** no topo centralizado: Usando a cor **Teal #159A9C** (Livro aberto / Lira musical / Megafone).
*   **Título Grande Centralizado**: Abaixo do ícone, em **Azul Marinho #002333**.
*   **Subtítulo Centralizado**: Uma breve descrição em **Cinza #B4BEC9**.
*   **Ação de Hover (Crucial)**: Ao passar o mouse, o cartão deve elevar-se ligeiramente e talvez a borda inferior ganhe uma linha grossa na cor Teal, indicando claramente "Clique aqui".

### C. Seção Inferior: Retomada Rápida (Abaixo das colunas principais)
Uma faixa horizontal que ocupa toda a largura do contêiner central.

*   **Título da seção**: "Sua última leitura" (Pequeno, em cinza).
*   **Cartão Horizontal Único**: Fundo branco, com uma borda esquerda grossa em **Teal #159A9C** para chamar atenção.
*   **Conteúdo**: Ícone pequeno de relógio (cinza) + Texto "Continuar lendo: Evangelho de João, Capítulo 3" (Azul Marinho) + Botão "Continuar" (Teal) na extrema direita.