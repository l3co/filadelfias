# language: pt

Funcionalidade: Permissões por Ofício Eclesiástico
  Como administrador do sistema
  Eu quero que cada ofício tenha permissões adequadas
  Para manter a governança bíblica

  @rbac @integration @needs-backend
  Cenário: Pastor tem acesso total
    Dado que estou logado como Pastor
    Então devo ver menu "Membros"
    E devo ver menu "Governança"
    E devo ver menu "Tesouraria"
    E devo ver menu "EBD"
    E devo ver menu "Missões"
    E devo ver menu "Configurações"
    E devo poder criar novos membros
    E devo poder excluir membros

  @rbac @integration @needs-backend
  Cenário: Presbítero tem acesso de governança
    Dado que estou logado como Presbítero
    Então devo ver menu "Membros"
    E devo ver menu "Governança"
    E devo ver menu "Tesouraria"
    E devo poder criar membros
    Mas NÃO devo poder excluir membros
    E NÃO devo poder editar configurações

  @rbac @integration @needs-backend
  Cenário: Diácono tem acesso limitado
    Dado que estou logado como Diácono
    Então devo ver menu "Membros"
    E devo ver menu "Tesouraria"
    Mas NÃO devo ver menu "Governança"
    E NÃO devo poder excluir membros

  @rbac @integration @needs-backend
  Cenário: Membro comum só vê área de membro
    Dado que estou logado como Membro
    Então devo ser redirecionado para "/membro"
    E NÃO devo ter acesso a "/app"

  @rbac @integration @needs-backend
  Cenário: Tentativa de acesso não autorizado
    Dado que estou logado como Membro
    Quando tento acessar "/app/governance"
    Então devo ser redirecionado para "/membro" ou ver mensagem de acesso negado
