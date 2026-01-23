# language: pt

Funcionalidade: Pedidos de Oração
  Como um membro da igreja
  Eu quero compartilhar e orar por pedidos
  Para fortalecer nossa comunidade

  @integration @needs-backend
  Cenário: Criar pedido de oração
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Quando clico em "Novo Pedido"
    E preencho o conteúdo "Oração pela minha família"
    E clico em "Enviar"
    Então meu pedido deve aparecer na lista

  @integration @needs-backend
  Cenário: Criar pedido anônimo
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Quando clico em "Novo Pedido"
    Então devo ver o formulário de pedido de oração

  @integration @needs-backend
  Cenário: Orar por um pedido
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Quando clico em "Orar"
    Então o contador de orações deve aumentar

  @integration @needs-backend
  Cenário: Visualizar meus pedidos
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Então devo ver meus pedidos de oração

  @integration @needs-backend
  Cenário: Filtrar pedidos por categoria
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Então devo ver pedidos na lista
