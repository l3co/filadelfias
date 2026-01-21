import { Outlet, Link } from 'react-router-dom';
import { Bell, LogOut, Menu, User, ChevronDown } from 'lucide-react';
import { useCurrentUser, useLogout, useCurrentTenant } from '../../hooks/useAuth';
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

export function MemberLayout() {
  const { data: user } = useCurrentUser();
  const tenant = useCurrentTenant();
  const logout = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo & Church Name */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/membro" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  {tenant?.name?.charAt(0) || 'I'}
                </span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline">
                {tenant?.name || 'Igreja'}
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline text-sm">
                    {user?.name?.split(' ')[0] || 'Usuário'}
                  </span>
                  <ChevronDown className="h-4 w-4 hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/membro/perfil">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 border-b">
          <h2 className="font-semibold">{tenant?.name || 'Igreja'}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/membro"
            className="block px-4 py-2 rounded-lg hover:bg-muted"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Início
          </Link>
          <Link
            to="/membro/biblia"
            className="block px-4 py-2 rounded-lg hover:bg-muted"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Bíblia
          </Link>
          <Link
            to="/membro/eventos"
            className="block px-4 py-2 rounded-lg hover:bg-muted"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Eventos
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {tenant?.name || 'Igreja'}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
