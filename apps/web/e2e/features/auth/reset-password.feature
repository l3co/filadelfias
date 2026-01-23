# language: pt

Funcionalidade: Redefinição de senha
  Como um usuário que recebeu um link de redefinição
  Eu quero redefinir minha senha
  Para poder acessar a plataforma

  @integration @needs-backend
  Cenário: Redefinir senha com sucesso
    Dado que estou na página de login
    Então devo ver o formulário de login
