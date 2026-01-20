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
