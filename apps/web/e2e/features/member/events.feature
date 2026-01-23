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

  @integration @needs-backend
  Cenário: Administrador cria evento
    Dado que estou logado como administrador
    Quando navego para "/app/events"
    Então devo ver a página de eventos admin
