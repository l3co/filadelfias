# language: pt

Funcionalidade: Tratamento de Erros
  Como usuário do sistema
  Eu quero ver mensagens de erro claras
  Para entender o que aconteceu

  @error-handling
  Cenário: Login com credenciais inválidas
    Dado que estou na página de login
    Quando preencho o email "usuario@invalido.com"
    E preencho a senha "senhaerrada"
    E clico no botão "Entrar"
    Então devo ver mensagem "Credenciais inválidas"
    E devo permanecer na página de login

  @error-handling @integration @needs-backend
  Cenário: Acesso não autorizado
    Dado que estou logado como Membro
    Quando tento acessar "/app/tesouraria"
    Então devo ser redirecionado para "/membro" ou ver mensagem de acesso negado

  @error-handling @integration @needs-backend
  Cenário: Sessão expirada
    Dado que minha sessão expirou
    Quando tento realizar uma ação
    Então devo ser redirecionado para login
    E devo ver mensagem "Sessão expirada"

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
    Dado que o backend está indisponível
    Quando tento fazer login
    Então devo ver mensagem de erro de conexão

  @error-handling
  Cenário: Página não encontrada
    Dado que estou logado como administrador
    Quando acesso uma rota inexistente "/app/rota-invalida"
    Então devo ver página de erro 404
    E devo ver opção para voltar ao dashboard
