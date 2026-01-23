# language: pt

Funcionalidade: Convite e acesso de membro
  Como um administrador
  Eu quero convidar membros para a plataforma
  Para que eles possam acessar a área de membros

  @journey @integration @needs-backend @skip
  Cenário: Fluxo completo de convite de membro
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando clico em "Novo Membro"
    E preencho o nome "João Silva"
    E preencho o email "joao@email.com"
    E seleciono status "Comungante"
    E clico em "Salvar"
    Então devo ver mensagem de sucesso
    E o membro deve aparecer na lista

  @journey @integration @needs-backend @skip
  Cenário: Membro acessa pela primeira vez
    Dado que existe um membro cadastrado "Maria Silva"
    Quando o membro faz login
    Então o membro deve ser redirecionado para "/membro"
    E o membro deve ver o dashboard de membros
    E o membro NÃO deve ver menu de administração

  @journey @integration @needs-backend
  Cenário: Membro não tem acesso à área administrativa
    Dado que estou logado como Membro
    Quando tento acessar "/app/financial"
    Então devo ser redirecionado para "/membro" ou ver mensagem de acesso negado
