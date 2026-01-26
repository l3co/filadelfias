import { useState, useMemo } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, Home, Users, Calendar, LogOut, Gavel, Wallet, Globe, BookOpen, Bell, Search, ChevronRight, X, Settings } from 'lucide-react';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionBadge } from '../PermissionGate';
import { cn } from '../../lib/utils';
import type { Resource } from '../../lib/permissions';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    resource?: Resource;
}

const allNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Membros', href: '/admin/members', icon: Users, resource: 'members' },
    { name: 'Governança', href: '/admin/governance', icon: Gavel, resource: 'governance' },
    { name: 'Tesouraria', href: '/admin/treasury', icon: Wallet, resource: 'financial' },
    { name: 'Missões', href: '/admin/missions', icon: Globe, resource: 'missions' },
    { name: 'EBD', href: '/admin/education', icon: BookOpen, resource: 'ebd' },
    { name: 'Eventos', href: '/admin/events', icon: Calendar, resource: 'events' },
    { name: 'Configurações', href: '/admin/settings', icon: Settings, resource: 'settings' },
];

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { data: user, isLoading } = useCurrentUser();
    const logout = useLogout();
    const { can } = usePermissions();

    const tenantName = user?.memberships?.[0]?.tenant?.name || 'Minha Igreja';

    // Filtra navegação baseada nas permissões do usuário
    const navigation = useMemo(() => {
        return allNavigation.filter(item => {
            // Dashboard é sempre visível
            if (!item.resource) return true;
            // Verifica se tem permissão de visualização
            return can(item.resource, 'view');
        });
    }, [can]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#DEEFE7]/30">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                    <span className="text-gray-500 font-medium">Carregando...</span>
                </div>
            </div>
        );
    }

    if (user && (!user.memberships || user.memberships.length === 0)) {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 h-screen bg-white shadow-2xl shadow-gray-200/50 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:shadow-none border-r border-gray-100 flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo Header */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
                    <Link to="/admin" className="flex items-center gap-2">
                        <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600">
                            Filadélfias
                        </h1>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tenant Selector - Links to Settings */}
                <div className="px-4 py-4 border-b border-gray-100">
                    <Link
                        to="/admin/settings"
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 rounded-xl transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {tenantName.charAt(0)}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{tenantName}</p>
                                <p className="text-xs text-gray-500">Clique para editar</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-green-50 to-teal-50 text-green-700 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <div className={cn(
                                    "mr-3 p-1.5 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-gradient-to-br from-green-600 to-teal-600 text-white shadow-sm"
                                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                                )}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                {item.name}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout - Always visible at bottom */}
                <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-white">
                    <Link
                        to="/admin/profile"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-3 hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-green-700 font-bold shadow-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                            <PermissionBadge />
                        </div>
                    </Link>
                    <button
                        onClick={() => logout.mutate()}
                        className="group flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors border border-transparent hover:border-red-100"
                    >
                        <LogOut className="h-4 w-4" />
                        Sair da conta
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 lg:px-8 shadow-sm shadow-gray-100/50">
                    {/* Left: Menu + Search */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex items-center">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Center: Mobile Logo */}
                    <div className="lg:hidden">
                        <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600">
                            Filadélfias
                        </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <button className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
                        </button>

                        {/* Desktop User Avatar */}
                        <div className="hidden lg:flex items-center gap-3 pl-3 ml-2 border-l border-gray-200">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.name?.split(' ')[0]}</p>
                                <p className="text-xs text-gray-500">{tenantName}</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-green-700 font-bold text-sm shadow-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-50/50 to-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
