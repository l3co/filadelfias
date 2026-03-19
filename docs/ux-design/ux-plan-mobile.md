# UX Plan — Mobile Application (React Native)
## 📱 Princípios Mobile-First

Este documento define o comportamento e layout da versão **MOBILE (iOS/Android)**.
*   **Navegação**: Tab Bar inferior (padrão de ergonomia).
*   **Toque**: Áreas de toque mínimas de 44x44pt.
*   **Offline**: Feedback visual claro quando estiver sem internet.

---

## 🏠 Home Mobile (Tab 1)
**Objetivo**: Informação rápida na palma da mão.

### Estrutura
*   **Header**:
    *   Saudação ("Bom dia, Leco") + Foto de perfil pequena.
    *   Ícone de notificação (sino).
*   **Destaque (Hero)**: Cartão do "Versículo do Dia" (Horizontal, scrollável se o texto for longo).
*   **Acesso Rápido (Grid 2x2)**:
    *   [📖 Bíblia] [🎼 Hinário]
    *   [📰 Boletim] [🙏 Pedidos de Oração]
*   **Feed**: Lista vertical infinita com avisos e postagens da igreja.

---

## 📖 Bíblia Mobile (Tab 2)
### Navegação
*   **Seletor Bottom Sheet**: Ao tocar no título (ex: "João 3"), abre um painel inferior (Bottom Sheet) para escolher Livro > Capítulo de forma rápida (roda de seleção ou grid numérico).

### Leitura
*   **Modo Tela Cheia**: Ao rolar para baixo, esconde a Tab Bar e o Header para maximizar a área de texto.
*   **Gestos**: Swipe lateral para mudar de capítulo.
*   **Ações no Versículo**: Long press (toque longo) no versículo abre menu: "Marcar", "Copiar", "Criar Nota".

---

## 🎼 Hinário Mobile (Tab 3)
*   **Busca Poderosa**: Search bar sempre visível no topo. Busca por número ou trecho da letra.
*   **Filtros**: Chips horizontais: "Hinos", "Cânticos", "Corinhos".

---

## 👤 Perfil & Carteirinha (Tab 4 ou 5)
*   **Carteirinha Digital**: Cartão visual com:
    *   Foto do membro.
    *   Nome completo.
    *   Cargo (Membro/Oficial).
    *   QR Code (para check-in em eventos/assembleias).
*   **Dados Pessoais**: Edição de telefone e endereço.

---

## 🗳️ Fluxo de Votação (Mobile)
1.  **Check-in**: Usuário abre a área de Votação.
2.  **Validação**: App pede permissão de localização ou câmera (para ler QR Code do telão).
3.  **Cédula**: Lista vertical de opções com radio buttons grandes.
4.  **Confirmação**: Botão "Confirmar Voto" (Full width, cor primária).
5.  **Recibo**: Tela de sucesso com hash da transação.
