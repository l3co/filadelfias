# language: pt

Funcionalidade: Permissões por Função
  Como administrador
  Eu quero que funções específicas tenham permissões extras
  Para delegar responsabilidades

  @rbac @integration @needs-backend
  Cenário: Tesoureiro tem acesso financeiro completo
    Dado que estou logado como administrador
    Então devo ver menu "Tesouraria"

  @rbac @integration @needs-backend
  Cenário: Secretário tem acesso a documentação
    Dado que estou logado como administrador
    Então devo ver menu "Governança"

  @rbac @integration @needs-backend
  Cenário: Membro sem função não vê áreas administrativas
    Dado que estou logado como membro
    Então NÃO devo ver menu "Tesouraria"
    E NÃO devo ver menu "Governança"
    E NÃO devo ver menu "Configurações"

  @rbac @integration @needs-backend @skip
  Cenário: Função pode ser combinada com ofício
    Dado que estou logado como Diácono com função "Tesoureiro"
    Então devo ver menu "Tesouraria"
    E devo ver menu "Membros"
    E devo poder criar transações
