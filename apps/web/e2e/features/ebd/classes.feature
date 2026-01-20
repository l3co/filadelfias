# language: pt

Funcionalidade: Gestão da EBD
  Como um administrador de igreja
  Eu quero gerenciar as classes da EBD
  Para acompanhar o ensino bíblico

  @integration @needs-backend
  Cenário: Visualizar classes
    Dado que estou logado como administrador
    E que estou na página de EBD
    Então devo ver lista de classes
