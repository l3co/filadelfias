# language: pt

Funcionalidade: Gestão de Governança
  Como um administrador de igreja
  Eu quero gerenciar os conselhos
  Para manter a governança organizada

  @integration @needs-backend
  Cenário: Visualizar conselhos
    Dado que estou logado como administrador
    E que estou na página de Governança
    Então devo ver lista de conselhos
