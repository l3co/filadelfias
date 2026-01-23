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

  @integration @needs-backend @skip
  Cenário: Criar pedido anônimo
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Quando clico em "Novo Pedido"
    E preencho o conteúdo "Pedido confidencial"
    E marco como anônimo
    E clico em "Enviar"
    Então o pedido deve aparecer sem meu nome

  @integration @needs-backend
  Cenário: Orar por um pedido
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Quando clico em "Orar"
    Então o contador de orações deve aumentar

  @integration @needs-backend @skip
  Cenário: Visualizar meus pedidos
    Dado que estou logado como membro
    E que criei pedidos de oração
    Quando acesso "Meus Pedidos"
    Então devo ver apenas meus pedidos
    E devo poder editar meus pedidos
    E devo poder excluir meus pedidos

  @integration @needs-backend @skip
  Cenário: Filtrar pedidos por categoria
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Quando seleciono categoria "Saúde"
    Então devo ver apenas pedidos de "Saúde"
