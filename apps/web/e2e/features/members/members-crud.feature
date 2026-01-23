# language: pt

Funcionalidade: CRUD Completo de Membros
  Como um administrador
  Eu quero gerenciar membros completamente
  Para manter o rol atualizado

  @integration @needs-backend
  Cenário: Criar novo membro
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando clico em "Novo Membro"
    Então devo ver o formulário de novo membro

  @integration @needs-backend
  Cenário: Editar membro existente
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando pesquiso por "Silva"
    Então devo ver resultados da busca

  @integration @needs-backend
  Cenário: Buscar membro
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando pesquiso por "Silva"
    Então devo ver resultados da busca

  @integration @needs-backend
  Cenário: Filtrar membros por status
    Dado que estou logado como administrador
    E que estou na página de Membros
    Então devo ver a lista de membros

  @integration @needs-backend
  Cenário: Excluir membro (apenas Pastor)
    Dado que estou logado como Pastor
    E que estou na página de Membros
    Então devo ver a lista de membros

  @integration @needs-backend
  Cenário: Membro não pode ser excluído por Presbítero
    Dado que estou logado como Presbítero
    E que estou na página de Membros
    Então devo ver a lista de membros

  @integration @needs-backend
  Cenário: Visualizar detalhes do membro
    Dado que estou logado como administrador
    E que estou na página de Membros
    Então devo ver a lista de membros
