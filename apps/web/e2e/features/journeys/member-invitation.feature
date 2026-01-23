# language: pt

Funcionalidade: Convite e acesso de membro
  Como um administrador
  Eu quero convidar membros para a plataforma
  Para que eles possam acessar a área de membros

  @journey @integration @needs-backend
  Cenário: Fluxo completo de convite de membro
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando clico em "Novo Membro"
    Então devo ver o formulário de novo membro

  @journey @integration @needs-backend
  Cenário: Membro acessa pela primeira vez
    Dado que estou logado como membro
    Então devo estar na área de membro
    E devo ver o dashboard de membros

  @journey @integration @needs-backend
  Cenário: Membro não tem acesso à área administrativa
    Dado que estou logado como Membro
    Quando tento acessar "/app/financial"
    Então devo ser redirecionado para "/membro" ou ver mensagem de acesso negado
