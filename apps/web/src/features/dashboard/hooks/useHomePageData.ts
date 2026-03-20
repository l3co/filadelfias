import { useMemo } from 'react';
import { Calendar, GraduationCap, Users, Wallet } from 'lucide-react';
import { useEvents } from '../../events/hooks/useEvents';
import { useMembers } from '../../members/hooks/useMembers';
import { useAuth } from '../../../contexts/AuthContext';
import { useFormattedStats } from '../../../hooks/useDashboardStats';

type HomePageStat = {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
};

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR');
};

const formatEventDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dayName = days[date.getDay()];
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return { dayName, time };
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

export function useHomePageData() {
  const { user, tenant } = useAuth();
  const dashboardStats = useFormattedStats();
  const { data: members } = useMembers(tenant?.id);
  const { data: events } = useEvents(tenant?.id);

  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  const tenantName = user?.memberships?.[0]?.tenant?.name || 'Minha Igreja';

  const recentMembers = useMemo(
    () =>
      (members ?? [])
        .filter((member) => member.created_at)
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
        .slice(0, 3)
        .map((member) => ({
          id: member.id,
          fullName: member.full_name,
          createdAtLabel: formatRelativeTime(member.created_at!),
        })),
    [members],
  );

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return (events ?? [])
      .filter((event) => new Date(event.start_date) >= now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 3)
      .map((event) => ({
        id: event.id,
        title: event.title,
        category: event.category || 'Evento',
        ...formatEventDate(event.start_date),
      }));
  }, [events]);

  const stats = useMemo<HomePageStat[]>(
    () => [
      {
        name: 'Membros Ativos',
        value: dashboardStats.members.active.toString(),
        change: `+${dashboardStats.members.newThisMonth}`,
        changeType: dashboardStats.members.newThisMonth > 0 ? 'positive' : 'neutral',
        icon: Users,
      },
      {
        name: 'Saldo Atual',
        value: dashboardStats.formatted.balance,
        change: dashboardStats.formatted.incomeThisMonth,
        changeType: 'positive',
        icon: Wallet,
      },
      {
        name: 'Total de Membros',
        value: dashboardStats.members.total.toString(),
        change: `${dashboardStats.members.inactive} inativos`,
        changeType: 'neutral',
        icon: GraduationCap,
      },
      {
        name: 'Receita do Mês',
        value: dashboardStats.formatted.incomeThisMonth,
        change: `${dashboardStats.formatted.expenseThisMonth} despesas`,
        changeType: 'positive',
        icon: Calendar,
      },
    ],
    [dashboardStats],
  );

  return {
    dashboardStats,
    firstName,
    greeting: getGreeting(),
    recentMembers,
    stats,
    tenantName,
    upcomingEvents,
  };
}
