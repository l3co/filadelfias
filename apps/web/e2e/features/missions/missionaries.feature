# language: pt

Funcionalidade: Gestão de Missões
  Como um administrador de igreja
  Eu quero gerenciar os missionários
  Para acompanhar o apoio missionário

  @integration @needs-backend
  Cenário: Visualizar missionários
    Dado que estou logado como administrador
    E que estou na página de Missões
    Então devo ver lista de missionários apoiados
