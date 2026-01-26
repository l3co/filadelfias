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
    Quando navego para "/admin/devotionals"
    Então devo ver a página de devocionais admin

  @integration @needs-backend
  Cenário: Membro visualiza lista de devocionais
    Dado que estou logado como membro
    E que estou na página de Devocionais
    Então devo ver lista de devocionais

  @integration @needs-backend
  Cenário: Membro lê devocional completo
    Dado que estou logado como membro
    E que estou na página de Devocionais
    Então devo ver o título do devocional
    E devo ver a referência bíblica
