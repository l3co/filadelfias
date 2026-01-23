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

  @integration @needs-backend @skip
  Cenário: Ver detalhes de um evento
    Dado que estou logado como membro
    E que existe um evento "Culto de Celebração"
    Quando clico no evento
    Então devo ver o título do evento
    E devo ver a descrição completa
    E devo ver data e horário
    E devo ver o local

  @integration @needs-backend @skip
  Cenário: Confirmar presença em evento
    Dado que estou logado como membro
    E que existe um evento futuro
    Quando confirmo minha presença
    Então devo ver confirmação de presença
    E o contador de confirmados deve aumentar

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
