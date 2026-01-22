# language: pt

Funcionalidade: Permissões por Função
  Como administrador
  Eu quero que funções específicas tenham permissões extras
  Para delegar responsabilidades

  @rbac @integration @needs-backend
  Cenário: Tesoureiro tem acesso financeiro completo
    Dado que estou logado como membro com função "Tesoureiro"
    Então devo ver menu "Tesouraria"
    E devo poder criar transações
    E devo poder gerar relatórios financeiros
    E devo poder visualizar saldo das contas

  @rbac @integration @needs-backend
  Cenário: Secretário tem acesso a documentação
    Dado que estou logado como membro com função "Secretário"
    Então devo ver menu "Governança"
    E devo poder criar atas de reunião
    E devo poder gerenciar documentos
    Mas NÃO devo poder excluir membros

  @rbac @integration @needs-backend
  Cenário: Membro sem função não vê áreas administrativas
    Dado que estou logado como membro
    Então NÃO devo ver menu "Tesouraria"
    E NÃO devo ver menu "Governança"
    E NÃO devo ver menu "Configurações"

  @rbac @integration @needs-backend
  Cenário: Função pode ser combinada com ofício
    Dado que estou logado como Diácono com função "Tesoureiro"
    Então devo ver menu "Tesouraria"
    E devo ver menu "Membros"
    E devo poder criar transações
