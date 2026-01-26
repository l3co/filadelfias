# language: pt

Funcionalidade: Gestão da Tesouraria
  Como um administrador de igreja
  Eu quero gerenciar as finanças
  Para manter o controle do orçamento

  @integration @needs-backend
  Cenário: Visualizar resumo financeiro
    Dado que estou logado como administrador
    E que estou na página de Tesouraria
    Então devo ver o saldo atual
    E devo ver total de entradas do mês
    E devo ver total de saídas do mês

  @integration @needs-backend
  Cenário: Navegar entre meses nas movimentações
    Dado que estou logado como administrador
    E que estou na página de Tesouraria
    Quando clico no botão de mês anterior
    Então devo ver o mês anterior no seletor
    Quando clico no botão de próximo mês
    Então devo ver o mês atual no seletor

  @skip @integration @needs-backend
  Cenário: Paginar lista de movimentações
    Dado que estou logado como administrador
    E que estou na página de Tesouraria
    E que existem mais de 10 movimentações no mês
    Quando clico em "Próxima" na paginação
    Então devo ver a segunda página de movimentações
    E devo ver "Página 2"

  @skip @integration @needs-backend
  Cenário: Cadastrar nova receita
    Dado que estou logado como administrador
    E que estou na página de Tesouraria
    Quando clico em "Nova Receita"
    E preencho a descrição "Oferta de Domingo"
    E preencho o valor "500"
    E seleciono uma conta
    E seleciono uma categoria
    E clico em "Salvar Lançamento"
    Então devo ver a mensagem "Receita cadastrada com sucesso"

  @skip @integration @needs-backend
  Cenário: Cadastrar nova despesa
    Dado que estou logado como administrador
    E que estou na página de Tesouraria
    Quando clico em "Nova Despesa"
    E preencho a descrição "Conta de Luz"
    E preencho o valor "200"
    E seleciono uma conta
    E seleciono uma categoria
    E clico em "Salvar Lançamento"
    Então devo ver a mensagem "Despesa cadastrada com sucesso"

  @skip @integration @needs-backend
  Cenário: Vincular membro a uma receita
    Dado que estou logado como administrador
    E que estou na página de Tesouraria
    Quando clico em "Nova Receita"
    E preencho a descrição "Dízimo João"
    E preencho o valor "1000"
    E seleciono uma conta
    E seleciono uma categoria
    E seleciono um membro
    E clico em "Salvar Lançamento"
    Então devo ver a mensagem "Receita cadastrada com sucesso"
