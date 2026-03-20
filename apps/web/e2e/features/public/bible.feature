# language: pt

Funcionalidade: Leitura da Bíblia
  Como um visitante
  Eu quero acessar a Bíblia online
  Para poder ler e estudar as Escrituras

  @smoke @smoke_public
  Cenário: Acessar página inicial da Bíblia
    Dado que estou na página da Bíblia
    Então devo ver o título "Bíblia Sagrada"
    E devo ver "Antigo Testamento"
    E devo ver "Novo Testamento"
