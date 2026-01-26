# language: pt

Funcionalidade: Gestão de Dízimos e Ofertas
  Como um membro da igreja
  Eu quero registrar meus dízimos e ofertas
  Para manter o controle das minhas contribuições

  @integration @needs-backend
  Cenário: Membro visualiza página de dízimos
    Dado que estou logado como membro
    E que estou na página "Meus Dízimos"
    Então devo ver o título "Meus Dízimos e Ofertas"
    E devo ver botão "Novo Registro"

  @integration @needs-backend
  Cenário: Membro registra novo dízimo
    Dado que estou logado como membro
    E que estou na página "Meus Dízimos"
    Quando clico em "Novo Registro"
    E preencho o valor "500"
    E preencho a data "2026-01-15"
    E clico em "Enviar para Aprovação"
    Então devo ver "Pendente" na lista

  @skip @integration @needs-backend
  Cenário: Membro registra nova oferta
    Dado que estou logado como membro
    E que estou na página "Meus Dízimos"
    Quando clico em "Novo Registro"
    E preencho o valor "100"
    E seleciono o tipo "Oferta"
    E preencho a data "2026-01-20"
    E adiciono observação "Oferta missionária"
    E clico em "Salvar"
    Então devo ver a mensagem "Registro enviado com sucesso"

  @skip @integration @needs-backend
  Cenário: Tesoureiro visualiza dízimos pendentes
    Dado que estou logado como tesoureiro
    E que estou na página de Tesouraria
    Então devo ver a seção "Dízimos Pendentes"
    E devo ver registros aguardando aprovação

  @skip @integration @needs-backend
  Cenário: Tesoureiro aprova dízimo
    Dado que estou logado como tesoureiro
    E que existe um dízimo pendente
    E que estou na página de Tesouraria
    Quando clico em "Aprovar" no registro pendente
    E seleciono a conta de destino
    E confirmo a aprovação
    Então devo ver a mensagem "Dízimo aprovado com sucesso"
    E o registro deve ser removido da lista de pendentes

  @skip @integration @needs-backend
  Cenário: Tesoureiro rejeita dízimo
    Dado que estou logado como tesoureiro
    E que existe um dízimo pendente
    E que estou na página de Tesouraria
    Quando clico em "Rejeitar" no registro pendente
    E informo o motivo "Comprovante ilegível"
    E confirmo a rejeição
    Então devo ver a mensagem "Dízimo rejeitado"
