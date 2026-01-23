# language: pt

Funcionalidade: Gestão Completa de EBD
  Como um administrador
  Eu quero gerenciar classes, alunos e lições
  Para organizar a Escola Bíblica Dominical

  @integration @needs-backend
  Cenário: Criar classe de EBD
    Dado que estou logado como administrador
    E que estou na página de EBD
    Quando clico em "Nova Turma"
    E preencho nome "Jovens"
    E defino faixa etária 15 a 25
    E clico em "Salvar"
    Então a classe deve aparecer na lista

  @integration @needs-backend @skip
  Cenário: Matricular aluno em classe
    Dado que estou logado como administrador
    E que existe uma classe "Jovens"
    E que existe um membro "Pedro Santos"
    Quando acesso a classe "Jovens"
    E clico em "Adicionar Aluno"
    E seleciono "Pedro Santos"
    Então o aluno deve aparecer na lista da classe

  @integration @needs-backend @skip
  Cenário: Membro vê sua turma
    Dado que estou logado como membro matriculado em "Jovens"
    E que estou na página de EBD (membro)
    Então devo ver minha classe "Jovens"
    E devo ver os materiais de estudo

  @integration @needs-backend @skip
  Cenário: Criar lição para classe
    Dado que estou logado como administrador
    E que existe uma classe "Jovens"
    Quando acesso a classe "Jovens"
    E clico em "Nova Lição"
    E preencho o título "O Amor de Cristo"
    E preencho a referência bíblica "1 Coríntios 13"
    E preencho o conteúdo
    E clico em "Salvar"
    Então a lição deve aparecer na lista

  @integration @needs-backend @skip
  Cenário: Registrar presença em aula
    Dado que estou logado como administrador
    E que existe uma classe "Jovens" com alunos
    Quando acesso a lista de presença
    E marco presença para "Pedro Santos"
    Então a presença deve ser registrada

  @integration @needs-backend @skip
  Cenário: Visualizar relatório de frequência
    Dado que estou logado como administrador
    E que existe uma classe "Jovens"
    Quando acesso relatórios da classe
    Então devo ver frequência dos alunos
    E devo ver percentual de presença
