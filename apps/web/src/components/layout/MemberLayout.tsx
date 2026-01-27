import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Bell, LogOut, Menu, User, ChevronDown, Home, X,
  BookOpen, BookMarked, Music, Users, Calendar, Globe, GraduationCap, Heart, MessageCircle, Gavel, Wallet, Receipt
} from 'lucide-react';
import { useCurrentUser, useLogout, useCurrentTenant } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '../../lib/utils';

const baseNavItems = [
  { href: '/member', label: 'Início', icon: Home },
  { href: '/member/bible', label: 'Bíblia', icon: BookOpen },
  { href: '/member/hymnal', label: 'Hinário', icon: Music },
  { href: '/member/manual', label: 'Manual', icon: BookMarked },
  { href: '/member/devotionals', label: 'Devocionais', icon: Heart },
  { href: '/member/directory', label: 'Membros', icon: Users },
  { href: '/member/governance', label: 'Governança', icon: Gavel },
  { href: '/member/events', label: 'Eventos', icon: Calendar },
  { href: '/member/missions', label: 'Missões', icon: Globe },
  { href: '/member/education', label: 'EBD', icon: GraduationCap },
  { href: '/member/prayer', label: 'Oração', icon: MessageCircle },
  { href: '/member/tithes', label: 'Dízimos', icon: Wallet },
];

const expenseNavItem = { href: '/member/expenses', label: 'Despesas', icon: Receipt };

// Gera acrônimo do nome da igreja (ex: "Igreja Presbiteriana Filadélfia" -> "IPF")
function getChurchAcronym(name?: string): string {
  if (!name) return 'IP';
  return name
    .split(' ')
    .filter(word => word.length > 2 && word[0] === word[0].toUpperCase())
    .map(word => word[0])
    .join('')
    .slice(0, 4) || name.slice(0, 3).toUpperCase();
}

export function MemberLayout() {
  const { data: user } = useCurrentUser();
  const tenant = useCurrentTenant();
  const logout = useLogout();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { canSubmitExpenses } = usePermissions();

  const handleLogout = () => {
    logout.mutate();
  };

  const churchAcronym = getChurchAcronym(tenant?.name);

  // Build nav items dynamically based on permissions
  const navItems = canSubmitExpenses
    ? [...baseNavItems, expenseNavItem]
    : baseNavItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header Premium */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo & Church */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>

            <Link to="/member" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <img src="/logo.svg" alt="Logo" className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {churchAcronym}
                </span>
                <p className="text-[10px] text-slate-400 -mt-0.5 font-medium tracking-wide uppercase">
                  Portal do Membro
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 6).map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-slate-100">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-xl hover:bg-slate-100 px-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-slate-600">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-sm font-medium text-slate-700">
                      {user?.name?.split(' ')[0] || 'Usuário'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/member/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair da conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu - Premium Style */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{churchAcronym}</h2>
              <p className="text-xs text-slate-500">Portal do Membro</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive ? "bg-emerald-100" : "bg-slate-100"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <span className="font-semibold text-slate-600">{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer Premium */}
      <footer className="border-t border-slate-200/50 bg-white/50 backdrop-blur-sm py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <img src="/logo.svg" alt="Logo" className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-slate-600">{tenant?.name}</span>
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Powered by <span className="font-semibold text-emerald-600">Filadélfias</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
