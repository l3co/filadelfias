# language: pt

Funcionalidade: Gestão de Reuniões
  Como um líder de igreja (Pastor/Presbítero)
  Eu quero gerenciar as reuniões dos conselhos
  Para manter registro das deliberações e presenças

  Contexto:
    Dado que estou logado como administrador
    E que existe um conselho cadastrado

  @integration @needs-backend
  Cenário: Visualizar lista de reuniões vazia
    Quando eu abro o dialog de reuniões do conselho
    Então devo ver a mensagem "Nenhuma reunião agendada"
    E devo ver botão "Nova Reunião"

  @integration @needs-backend
  Cenário: Agendar nova reunião ordinária
    Quando eu abro o dialog de reuniões do conselho
    E clico em "Nova Reunião"
    E preencho o formulário de reunião:
      | campo        | valor                      |
      | tipo         | Reunião Ordinária          |
      | data         | 2026-02-15                 |
      | horario      | 19:30                      |
      | local        | Salão da Igreja            |
      | pauta        | Planejamento do semestre   |
    E confirmo o agendamento
    Então devo ver a mensagem "Reunião agendada com sucesso"
    E a reunião deve aparecer na aba "Próximas"

  @integration @needs-backend
  Cenário: Agendar reunião extraordinária
    Quando eu abro o dialog de reuniões do conselho
    E clico em "Nova Reunião"
    E seleciono o tipo "Reunião Extraordinária"
    E preencho os dados da reunião
    E confirmo o agendamento
    Então a reunião deve aparecer com badge "Extraordinária"

  @integration @needs-backend
  Cenário: Visualizar detalhes de reunião agendada
    Dado que existe uma reunião agendada no conselho
    Quando eu abro o dialog de reuniões do conselho
    E clico em "Detalhes" da reunião
    Então devo ver os dados da reunião:
      | campo     | visivel              |
      | data      | sim                  |
      | local     | sim                  |
      | pauta     | sim                  |
    E devo ver a lista de presença vazia
    E devo ver opção para editar ata

  @integration @needs-backend
  Cenário: Registrar ata da reunião
    Dado que existe uma reunião agendada no conselho
    Quando eu abro o dialog de reuniões do conselho
    E clico em "Detalhes" da reunião
    E clico em "Editar" na seção de ata
    E preencho a ata com "Deliberações importantes da reunião..."
    E clico em "Salvar"
    Então devo ver a mensagem "Reunião atualizada com sucesso"
    E a ata deve estar salva

  @integration @needs-backend
  Cenário: Marcar presença de membros
    Dado que existe uma reunião agendada no conselho
    E que o conselho possui membros cadastrados
    Quando eu abro o dialog de reuniões do conselho
    E clico em "Detalhes" da reunião
    E marco os membros presentes na lista
    Então a contagem de presenças deve ser atualizada

  @integration @needs-backend
  Cenário: Finalizar reunião
    Dado que existe uma reunião agendada no conselho
    Quando eu abro o dialog de reuniões do conselho
    E clico em "Detalhes" da reunião
    E clico em "Finalizar Reunião"
    Então devo ver a mensagem "Reunião finalizada com sucesso"
    E a reunião deve aparecer na aba "Realizadas"

  @skip @integration @needs-backend
  Cenário: Reunião finalizada não pode ser editada
    Dado que existe uma reunião finalizada no conselho
    Quando eu abro os detalhes da reunião
    Então não devo ver o botão "Editar"
    E não devo ver o botão "Finalizar Reunião"
    E devo ver a ata em modo somente leitura

  @skip @integration @needs-backend
  Cenário: Visualizar aba de reuniões realizadas
    Dado que existem reuniões finalizadas no conselho
    Quando eu abro o dialog de reuniões do conselho
    E clico na aba "Realizadas"
    Então devo ver a lista de reuniões passadas
    E cada reunião deve mostrar indicador de presença
    E cada reunião deve ter opção "Ver Ata"
