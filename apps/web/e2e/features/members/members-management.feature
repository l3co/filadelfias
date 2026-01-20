# language: pt

Funcionalidade: Gestão de Membros
  Como um administrador de igreja
  Eu quero gerenciar os membros
  Para manter o cadastro atualizado

  @integration @needs-backend
  Cenário: Visualizar lista de membros
    Dado que estou logado como administrador
    E que estou na página de Membros
    Então devo ver a tabela de membros
    E devo ver campo de busca
    E devo ver botão "Novo Membro"
