# language: pt

Funcionalidade: Navegação na área administrativa
  Como um usuário logado
  Eu quero navegar pelo sistema
  Para acessar os diferentes módulos

  @integration @needs-backend
  Cenário: Visualizar dashboard
    Dado que estou logado como administrador
    Então devo ser redirecionado para "/app"
    E devo ver o nome da minha igreja
    E devo ver menu lateral com todos os módulos
