# language: pt

Funcionalidade: Cadastro de nova igreja
  Como um líder de igreja
  Eu quero cadastrar minha igreja na plataforma
  Para utilizar as ferramentas de gestão

  Contexto:
    Dado que estou na página de cadastro de igreja

  @smoke
  Cenário: Visualizar wizard de cadastro
    Então devo ver o passo "Dados da Igreja"
    E devo ver campo de nome da igreja
    E devo ver campo de identificador

  @smoke
  Cenário: Preencher dados básicos da igreja
    Quando preencho o nome da igreja "Igreja Presbiteriana Central"
    E preencho o identificador "ipc-centro"
    Então devo ver preview da URL "ipc-centro"

  Cenário: Preenchimento automático por CEP
    Dado que estou no passo de endereço
    Quando preencho o CEP "01310-100"
    Então o campo rua deve ser preenchido automaticamente
    E o campo cidade deve ser preenchido automaticamente
