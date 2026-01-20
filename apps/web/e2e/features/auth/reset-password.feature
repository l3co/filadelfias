# language: pt

Funcionalidade: Redefinição de senha
  Como um usuário que recebeu um link de redefinição
  Eu quero redefinir minha senha
  Para poder acessar a plataforma

  @integration @needs-backend
  Cenário: Redefinir senha com sucesso
    Dado que acessei o link de redefinição válido
    Quando preencho a nova senha "NovaSenha@123"
    E confirmo a senha "NovaSenha@123"
    E clico no botão "Redefinir"
    Então devo ver mensagem "Senha alterada com sucesso"
