# language: pt

Funcionalidade: Permissões por Ofício Eclesiástico
  Como administrador do sistema
  Eu quero que cada ofício tenha permissões adequadas
  Para manter a governança bíblica

  @rbac @integration @needs-backend
  Cenário: Pastor tem acesso total
    Dado que estou logado como Pastor
    E que acesso o modo administração
    Então devo ver menu "Membros"
    E devo ver menu "Governança"
    E devo ver menu "Tesouraria"
    E devo ver menu "EBD"
    E devo ver menu "Missões"
    E devo ver menu "Configurações"

  @rbac @integration @needs-backend
  Cenário: Presbítero tem acesso de governança
    Dado que estou logado como Presbítero
    E que acesso o modo administração
    Então devo ver menu "Membros"
    E devo ver menu "Governança"
    E devo ver menu "Tesouraria"
    E devo poder criar membros
    Mas NÃO devo poder excluir membros
    E NÃO devo poder editar configurações

  @rbac @integration @needs-backend
  Cenário: Diácono tem acesso limitado
    Dado que estou logado como Diácono
    E que acesso o modo administração
    Então devo ver menu "Membros"
    E devo ver menu "Tesouraria"
    Mas NÃO devo ver menu "Governança"
    E NÃO devo poder excluir membros

  @rbac @integration @needs-backend
  Cenário: Membro comum só vê área de membro
    Dado que estou logado como Membro
    Então devo ser redirecionado para "/member"

  @rbac @integration @needs-backend
  Cenário: Tentativa de acesso não autorizado
    Dado que estou logado como Membro
    Quando tento acessar "/admin/governance"
    Então devo ser redirecionado para "/member" ou ver mensagem de acesso negado
