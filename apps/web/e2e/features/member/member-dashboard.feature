# language: pt

Funcionalidade: Dashboard do Membro
  Como um membro da igreja
  Eu quero acessar minha área
  Para participar da comunidade

  Contexto:
    Dado que estou logado como membro

  @integration @needs-backend
  Cenário: Visualizar dashboard de membro
    Então devo ser redirecionado para "/member"
    E devo ver card "Bíblia Online"
    E devo ver card "Devocionais"
    E devo ver card "Pedidos de Oração"
    E devo ver card "Eventos"
    E devo ver card "Membros"
    E devo ver card "EBD"
    E devo ver card "Missões"

  @integration @needs-backend
  Cenário: Membro não vê opções administrativas
    Então NÃO devo ver link para "Tesouraria"
    E NÃO devo ver link para "Governança"
    E NÃO devo ver link para "Configurações"

  @integration @needs-backend
  Cenário: Navegar para Bíblia Online
    Quando clico em card "Bíblia"
    Então devo ser redirecionado para "/member/bible"

  @integration @needs-backend
  Cenário: Navegar para Devocionais
    Quando clico em card "Devocionais"
    Então devo ser redirecionado para "/member/devotionals"

  @integration @needs-backend
  Cenário: Navegar para Pedidos de Oração
    Quando clico em card "Pedidos de Oração"
    Então devo ser redirecionado para "/member/prayer"
