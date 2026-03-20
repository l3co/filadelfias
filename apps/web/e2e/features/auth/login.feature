# language: pt

Funcionalidade: Login de usuário
  Como um usuário cadastrado
  Eu quero fazer login na plataforma
  Para acessar a área administrativa da minha igreja

  Contexto:
    Dado que estou na página de login

  @smoke @smoke_public
  Cenário: Verificar página de login
    Então devo ver o título "Bem-vindo de volta"
    E devo ver campo de email
    E devo ver campo de senha
    E devo ver botão "Entrar"

  @integration @needs-backend @smoke_auth @critical
  Cenário: Login com credenciais válidas
    Quando preencho o email "admin@igreja.com"
    E preencho a senha "MinhaS3nh@Segura"
    E clico no botão "Entrar"
    Então devo ser redirecionado para "/member"

  @smoke @smoke_public
  Cenário: Verificar validação de campos
    Quando deixo o campo senha vazio
    E clico no botão "Entrar"
    Então devo permanecer na página de login

  Cenário: Navegar para recuperação de senha
    Quando clico no link "Esqueceu a senha?"
    Então devo ser redirecionado para "/forgot-password"
