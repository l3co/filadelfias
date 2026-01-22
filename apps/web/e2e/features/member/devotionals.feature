# language: pt

Funcionalidade: Devocionais
  Como um membro da igreja
  Eu quero ler os devocionais
  Para minha edificação espiritual

  @integration @needs-backend
  Cenário: Visualizar devocional do dia
    Dado que estou logado como membro
    E que estou na página de Devocionais
    Então devo ver o devocional de hoje
    E devo ver o título do devocional
    E devo ver a referência bíblica
    E devo ver o texto da meditação

  @integration @needs-backend
  Cenário: Administrador cria devocional
    Dado que estou logado como administrador
    E que estou na página de Devocionais (admin)
    Quando clico em "Novo Devocional"
    E preencho o título "Amor de Deus"
    E preencho a referência "João 3:16"
    E preencho o texto do versículo
    E preencho a meditação
    E clico em "Salvar"
    Então devo ver mensagem de sucesso
    E o devocional deve aparecer na lista

  @integration @needs-backend
  Cenário: Membro visualiza lista de devocionais
    Dado que estou logado como membro
    E que estou na página de Devocionais
    Então devo ver lista de devocionais
    E cada devocional deve mostrar título
    E cada devocional deve mostrar data

  @integration @needs-backend
  Cenário: Membro lê devocional completo
    Dado que estou logado como membro
    E que estou na página de Devocionais
    Quando clico em um devocional
    Então devo ver o título completo
    E devo ver a referência bíblica
    E devo ver o texto do versículo
    E devo ver a meditação completa
