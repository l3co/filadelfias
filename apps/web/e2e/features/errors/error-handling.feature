# language: pt

Funcionalidade: Tratamento de Erros
  Como usuário do sistema
  Eu quero ver mensagens de erro claras
  Para entender o que aconteceu

  @error-handling @needs-backend
  Cenário: Login com credenciais inválidas
    Dado que estou na página de login
    Quando preencho o email "usuario@invalido.com"
    E preencho a senha "senhaerrada"
    E clico no botão "Entrar"
    Então devo ver mensagem "Email ou senha incorretos"
    E devo permanecer na página de login

  @error-handling @integration @needs-backend
  Cenário: Acesso não autorizado
    Dado que estou logado como Membro
    Quando tento acessar "/app/financial"
    Então devo ser redirecionado para "/membro" ou ver mensagem de acesso negado

  @error-handling @integration @needs-backend
  Cenário: Sessão expirada
    Dado que estou na página de login
    Então devo ver o formulário de login

  @error-handling
  Cenário: Formulário com campos obrigatórios vazios
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando clico em "Novo Membro"
    E clico em "Salvar" sem preencher campos
    Então devo ver erro de validação
    E o formulário não deve ser enviado

  @error-handling @integration @needs-backend
  Cenário: Erro de conexão com backend
    Dado que estou na página de login
    Então devo ver o formulário de login

  @error-handling
  Cenário: Página não encontrada
    Dado que estou na página de login
    Então devo ver o formulário de login
