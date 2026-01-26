# language: pt

Funcionalidade: Permissões por Função
  Como administrador
  Eu quero que funções específicas tenham permissões extras
  Para delegar responsabilidades

  @rbac @integration @needs-backend
  Cenário: Tesoureiro tem acesso financeiro completo
    Dado que estou logado como administrador
    E que acesso o modo administração
    Então devo ver menu "Tesouraria"

  @rbac @integration @needs-backend
  Cenário: Secretário tem acesso a documentação
    Dado que estou logado como administrador
    E que acesso o modo administração
    Então devo ver menu "Governança"

  @rbac @integration @needs-backend
  Cenário: Membro sem função não vê áreas administrativas
    Dado que estou logado como membro
    Então devo ser redirecionado para "/member"

  @rbac @integration @needs-backend
  Cenário: Função pode ser combinada com ofício
    Dado que estou logado como administrador
    E que acesso o modo administração
    Então devo ver menu "Tesouraria"
    E devo ver menu "Membros"
