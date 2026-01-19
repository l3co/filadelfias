import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, Home, Users, Calendar, LogOut, Gavel, Wallet } from 'lucide-react';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/app', icon: Home },
    { name: 'Membros', href: '/app/members', icon: Users },
    { name: 'Governo', href: '/app/governance', icon: Gavel },
    { name: 'Tesouraria', href: '/app/financial', icon: Wallet },
    { name: 'Eventos', href: '/app/events', icon: Calendar },
];

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { data: user, isLoading } = useCurrentUser();
    const logout = useLogout();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando...</div>;
    }

    if (user && (!user.memberships || user.memberships.length === 0)) {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:shadow-none border-r border-gray-200 flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-indigo-600">Filadelfias</h1>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive
                                            ? "text-indigo-500"
                                            : "text-gray-400 group-hover:text-gray-500"
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center mb-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700 truncate max-w-[140px]">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout.mutate()}
                        className="group flex w-full items-center px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500 group-hover:text-red-600" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 lg:hidden shadow-sm">
                    <button
                        type="button"
                        className="-ml-2 p-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-semibold text-gray-900">Filadelfias</span>
                    <div className="w-6" />
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
