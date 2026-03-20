# language: pt

Funcionalidade: Consulta ao Hinário
  Como um visitante
  Eu quero acessar o hinário online
  Para encontrar hinos para uso no culto

  @smoke @smoke_public
  Cenário: Acessar página do Hinário
    Dado que estou na página do Hinário
    Então devo ver o título "Novo Cântico"
    E devo ver "Hinário Presbiteriano"
