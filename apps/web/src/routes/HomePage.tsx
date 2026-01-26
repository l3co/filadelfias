import { useCurrentUser, useCurrentTenant } from '../hooks/useAuth';
import { useFormattedStats } from '../hooks/useDashboardStats';
import { useMembers } from '../features/members/hooks/useMembers';
import { useEvents } from '../features/events/hooks/useEvents';
import { Link } from 'react-router-dom';
import { Users, Wallet, GraduationCap, Gavel, Globe, Calendar, TrendingUp, ArrowRight, Sparkles, UserPlus } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const quickActions = [
    { name: 'Membros', href: '/app/members', icon: Users, color: 'from-green-500 to-green-600' },
    { name: 'Tesouraria', href: '/app/financial', icon: Wallet, color: 'from-teal-500 to-teal-600' },
    { name: 'EBD', href: '/app/ebd', icon: GraduationCap, color: 'from-blue-500 to-blue-600' },
    { name: 'Governança', href: '/app/governance', icon: Gavel, color: 'from-purple-500 to-purple-600' },
    { name: 'Missões', href: '/app/missions', icon: Globe, color: 'from-orange-500 to-orange-600' },
    { name: 'Eventos', href: '/app/events', icon: Calendar, color: 'from-pink-500 to-pink-600' },
];

export default function HomePage() {
    const { data: user } = useCurrentUser();
    const tenant = useCurrentTenant();
    const dashboardStats = useFormattedStats();
    const { data: members } = useMembers(tenant?.id);
    const { data: events } = useEvents(tenant?.id);
    const firstName = user?.name?.split(' ')[0] || 'Usuário';
    const tenantName = user?.memberships?.[0]?.tenant?.name || 'Minha Igreja';

    // Membros recentes (últimos 5 cadastrados)
    const recentMembers = members
        ?.filter(m => m.created_at)
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
        .slice(0, 3) || [];

    // Próximos eventos (ordenados por data, apenas futuros)
    const upcomingEvents = events
        ?.filter(e => new Date(e.start_date) >= new Date())
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .slice(0, 3) || [];

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

    const stats = [
        { 
            name: 'Membros Ativos', 
            value: dashboardStats.members.active.toString(), 
            change: `+${dashboardStats.members.newThisMonth}`, 
            changeType: dashboardStats.members.newThisMonth > 0 ? 'positive' : 'neutral', 
            icon: Users 
        },
        { 
            name: 'Saldo Atual', 
            value: dashboardStats.formatted.balance, 
            change: dashboardStats.formatted.incomeThisMonth, 
            changeType: 'positive', 
            icon: Wallet 
        },
        { 
            name: 'Total de Membros', 
            value: dashboardStats.members.total.toString(), 
            change: `${dashboardStats.members.inactive} inativos`, 
            changeType: 'neutral', 
            icon: GraduationCap 
        },
        { 
            name: 'Receita do Mês', 
            value: dashboardStats.formatted.incomeThisMonth, 
            change: dashboardStats.formatted.expenseThisMonth + ' despesas', 
            changeType: 'positive', 
            icon: Calendar 
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-[#002333] tracking-tight">
                    {getGreeting()}, {firstName}!
                </h1>
                <p className="mt-1 text-gray-500">
                    Aqui está o resumo da sua comunidade hoje.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {dashboardStats.isLoading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <Skeleton className="h-4 w-24 mb-3" />
                                <Skeleton className="h-8 w-32 mb-4" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        ))}
                    </>
                ) : (
                    stats.map((stat) => (
                        <div
                            key={stat.name}
                            className="group bg-white rounded-2xl p-6 shadow-sm shadow-gray-100 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                    <p className="mt-2 text-3xl font-bold text-[#002333]">{stat.value}</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 text-green-600 group-hover:scale-110 transition-transform duration-300">
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5">
                                {stat.changeType === 'positive' && (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                )}
                                <span className={`text-sm font-medium ${
                                    stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {stat.change}
                                </span>
                                <span className="text-sm text-gray-400">este mês</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Welcome Card */}
            <div className="relative bg-gradient-to-br from-[#002333] via-green-900 to-[#002333] rounded-2xl p-8 lg:p-10 text-white overflow-hidden shadow-xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                            <Sparkles size={14} className="text-green-300" />
                            <span className="text-green-100">{tenantName}</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-bold">
                            Bem-vindo ao painel administrativo
                        </h2>
                        <p className="text-green-100/80 max-w-xl leading-relaxed">
                            Gerencie membros, acompanhe as finanças, organize eventos e muito mais. 
                            Tudo em um só lugar para facilitar a administração da sua igreja.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/app/members"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg"
                        >
                            Ver Membros
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            to="/app/financial"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                        >
                            Tesouraria
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-[#002333] mb-4">Acesso Rápido</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            to={action.href}
                            className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <action.icon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                {action.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity & Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-[#002333] mb-4">Membros Recentes</h3>
                    <div className="space-y-4">
                        {recentMembers.length > 0 ? (
                            recentMembers.map((member) => (
                                <div key={member.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-green-600">
                                        <UserPlus size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                                        <p className="text-xs text-gray-500">{formatRelativeTime(member.created_at!)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Nenhum membro cadastrado recentemente</p>
                        )}
                    </div>
                    <Link 
                        to="/app/members"
                        className="mt-4 w-full inline-flex items-center justify-center text-sm text-green-600 hover:text-green-700 font-medium py-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                        Ver todos os membros
                    </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-[#002333] mb-4">Próximos Eventos</h3>
                    <div className="space-y-4">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => {
                                const { dayName, time } = formatEventDate(event.start_date);
                                return (
                                    <div key={event.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 flex flex-col items-center justify-center">
                                            <span className="text-xs font-bold text-green-700">{dayName}</span>
                                            <span className="text-[10px] text-gray-500">{time}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                            <p className="text-xs text-gray-500">{event.category || 'Evento'}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-400" />
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Nenhum evento agendado</p>
                        )}
                    </div>
                    <Link 
                        to="/app/events"
                        className="mt-4 w-full inline-flex items-center justify-center text-sm text-green-600 hover:text-green-700 font-medium py-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                        Ver calendário completo
                    </Link>
                </div>
            </div>
        </div>
    );
}
