# language: pt

Funcionalidade: Configurações da Igreja
  Como um administrador de igreja
  Eu quero gerenciar as configurações
  Para manter os dados atualizados

  @integration @needs-backend
  Cenário: Visualizar dados da igreja
    Dado que estou logado como administrador
    E que estou na página de Configurações
    Então devo ver o nome da igreja
    E devo ver o endereço
    E devo ver informações de contato
