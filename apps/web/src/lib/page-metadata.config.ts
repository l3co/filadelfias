import { matchPath } from 'react-router-dom';
import { ROUTES } from './routes';

export interface PageMetadata {
  description: string;
  title: string;
}

const DEFAULT_METADATA: PageMetadata = {
  title: 'Filadélfias',
  description: 'Sistema de gestão eclesiástica com recursos para comunhão, operação e formação da igreja.',
};

const METADATA_ROUTES: Array<{ metadata: PageMetadata; path: string }> = [
  {
    path: ROUTES.PUBLIC.HOME,
    metadata: {
      title: 'Filadélfias',
      description: 'Ferramentas para fortalecer a comunhão, a organização e a rotina da sua igreja.',
    },
  },
  {
    path: ROUTES.AUTH.LOGIN,
    metadata: {
      title: 'Entrar',
      description: 'Acesse sua conta para administrar a vida da igreja e acompanhar os módulos do sistema.',
    },
  },
  {
    path: ROUTES.AUTH.REGISTER,
    metadata: {
      title: 'Cadastro da Igreja',
      description: 'Cadastre sua igreja e configure o ambiente inicial do Filadélfias.',
    },
  },
  {
    path: ROUTES.AUTH.ONBOARDING,
    metadata: {
      title: 'Onboarding',
      description: 'Finalize a configuração inicial da sua igreja no Filadélfias.',
    },
  },
  {
    path: ROUTES.ADMIN.ROOT,
    metadata: {
      title: 'Painel Administrativo',
      description: 'Visão geral da gestão eclesiástica com acesso rápido aos módulos administrativos.',
    },
  },
  {
    path: ROUTES.ADMIN.MEMBERS,
    metadata: {
      title: 'Membros',
      description: 'Gerencie cadastro, convites e acompanhamento da membresia da igreja.',
    },
  },
  {
    path: ROUTES.ADMIN.GOVERNANCE,
    metadata: {
      title: 'Governança',
      description: 'Acompanhe conselhos, reuniões, atas e estrutura de governança da igreja.',
    },
  },
  {
    path: ROUTES.ADMIN.TREASURY,
    metadata: {
      title: 'Tesouraria',
      description: 'Controle finanças, patrimônio, movimentações e relatórios mensais da igreja.',
    },
  },
  {
    path: ROUTES.ADMIN.MISSIONS,
    metadata: {
      title: 'Missões',
      description: 'Gerencie missionários, projetos sociais e pedidos de oração vinculados à missão.',
    },
  },
  {
    path: ROUTES.ADMIN.EVENTS,
    metadata: {
      title: 'Eventos',
      description: 'Planeje e acompanhe eventos, programação e participação da comunidade.',
    },
  },
  {
    path: ROUTES.ADMIN.DEVOTIONALS,
    metadata: {
      title: 'Devocionais',
      description: 'Organize leituras, reflexões e materiais devocionais da igreja.',
    },
  },
  {
    path: ROUTES.ADMIN.SETTINGS,
    metadata: {
      title: 'Configurações',
      description: 'Ajuste parâmetros, identidade e preferências do ambiente administrativo.',
    },
  },
  {
    path: ROUTES.MEMBER.ROOT,
    metadata: {
      title: 'Portal do Membro',
      description: 'Acesse sua área com eventos, oração, missões, formação e serviços da igreja.',
    },
  },
  {
    path: ROUTES.MEMBER.DIRECTORY,
    metadata: {
      title: 'Diretório',
      description: 'Consulte o diretório de membros e as informações essenciais da comunidade.',
    },
  },
  {
    path: ROUTES.MEMBER.PRAYER,
    metadata: {
      title: 'Oração',
      description: 'Compartilhe pedidos, acompanhe intercessões e fortaleça a vida de oração da igreja.',
    },
  },
  {
    path: ROUTES.MEMBER.TITHES,
    metadata: {
      title: 'Dízimos e Ofertas',
      description: 'Registre contribuições, acompanhe histórico e envie lançamentos para aprovação.',
    },
  },
  {
    path: ROUTES.MEMBER.EXPENSES,
    metadata: {
      title: 'Despesas',
      description: 'Acompanhe reembolsos e lançamentos financeiros do portal do membro.',
    },
  },
];

export function resolvePageMetadata(pathname: string): PageMetadata {
  const matchedRoute = [...METADATA_ROUTES]
    .sort((left, right) => right.path.length - left.path.length)
    .find(({ path }) => matchPath({ path, end: path === ROUTES.PUBLIC.HOME }, pathname));

  return matchedRoute?.metadata ?? DEFAULT_METADATA;
}
