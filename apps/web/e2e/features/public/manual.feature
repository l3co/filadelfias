# language: pt

Funcionalidade: Consulta ao Manual Presbiteriano
  Como um visitante
  Eu quero acessar o Manual Presbiteriano
  Para consultar normas e procedimentos

  @smoke @smoke_public
  Cenário: Acessar página do Manual
    Dado que estou na página do Manual
    Então devo ver o título "Manual Presbiteriano"
