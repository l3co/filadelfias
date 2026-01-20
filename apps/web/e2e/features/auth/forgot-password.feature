# language: pt

Funcionalidade: Recuperação de senha
  Como um usuário que esqueceu a senha
  Eu quero poder recuperar minha senha
  Para conseguir acessar a plataforma novamente

  Contexto:
    Dado que estou na página de recuperação de senha

  @smoke
  Cenário: Verificar página de recuperação
    Então devo ver o título "Esqueceu sua senha"
    E devo ver botão "Enviar"
