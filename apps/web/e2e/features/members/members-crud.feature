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
    E preencho o nome "Maria Santos"
    E preencho o email "maria@email.com"
    E seleciono status "Comungante"
    E clico em "Salvar"
    Então devo ver mensagem de sucesso
    E o membro deve aparecer na lista

  @integration @needs-backend
  Cenário: Editar membro existente
    Dado que estou logado como administrador
    E que existe um membro "João Silva"
    Quando acesso a edição do membro
    E altero o telefone para "(11) 99999-0000"
    E clico em "Salvar"
    Então devo ver mensagem de sucesso
    E as alterações devem ser salvas

  @integration @needs-backend
  Cenário: Buscar membro
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando pesquiso por "Silva"
    Então devo ver apenas membros com "Silva" no nome

  @integration @needs-backend
  Cenário: Filtrar membros por status
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando seleciono filtro "Comungante"
    Então devo ver apenas membros comungantes

  @integration @needs-backend
  Cenário: Excluir membro (apenas Pastor)
    Dado que estou logado como Pastor
    E que existe um membro "Carlos Inativo"
    Quando excluo o membro
    Então devo ver confirmação
    E confirmo a exclusão
    E o membro não deve mais aparecer na lista

  @integration @needs-backend
  Cenário: Membro não pode ser excluído por Presbítero
    Dado que estou logado como Presbítero
    E que existe um membro "Carlos Teste"
    Então NÃO devo ver opção de excluir membro

  @integration @needs-backend
  Cenário: Visualizar detalhes do membro
    Dado que estou logado como administrador
    E que existe um membro "Maria Santos"
    Quando clico no membro
    Então devo ver todos os dados do membro
    E devo ver histórico de atividades
