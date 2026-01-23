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

  @integration @needs-backend
  Cenário: Matricular aluno em classe
    Dado que estou logado como administrador
    E que estou na página de EBD
    Quando clico em "Alunos" na classe "Jovens"
    E clico em "Matricular Aluno"
    Então devo ver o formulário de matrícula

  @integration @needs-backend
  Cenário: Membro vê sua turma
    Dado que estou logado como administrador
    E que estou na página de EBD
    Então devo ver a classe "Jovens"

  @integration @needs-backend
  Cenário: Criar lição para classe
    Dado que estou logado como administrador
    E que estou na página de EBD
    Quando clico na classe "Jovens"
    Então devo ver detalhes da classe

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
