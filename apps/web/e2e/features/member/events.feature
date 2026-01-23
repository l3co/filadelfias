# language: pt

Funcionalidade: Eventos
  Como um membro da igreja
  Eu quero ver os próximos eventos
  Para participar das atividades

  @integration @needs-backend
  Cenário: Visualizar lista de eventos
    Dado que estou logado como membro
    E que estou na página de Eventos
    Então devo ver lista de eventos futuros

  @integration @needs-backend
  Cenário: Ver detalhes de um evento
    Dado que estou logado como membro
    E que estou na página de Eventos
    Quando clico no evento
    Então devo ver o título do evento

  @integration @needs-backend
  Cenário: Confirmar presença em evento
    Dado que estou logado como membro
    E que estou na página de Eventos
    Então devo ver eventos na lista

  @integration @needs-backend @skip
  Cenário: Administrador cria evento
    Dado que estou logado como administrador
    E que estou na página de Eventos (admin)
    Quando clico em "Novo Evento"
    E preencho o título "Conferência Missionária"
    E preencho a descrição
    E seleciono a data "2026-03-20"
    E preencho o horário "09:00"
    E preencho o local "Auditório Central"
    E clico em "Salvar"
    Então devo ver mensagem de sucesso
    E o evento deve aparecer na lista
