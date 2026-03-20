import { Link } from 'react-router-dom';
import { Settings, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { ROUTES } from '../lib/routes';

interface AdminAccessCardProps {
  userRole?: string;
  className?: string;
}

const ADMIN_ROLES = ['ADMIN', 'PASTOR', 'TESOUREIRO', 'PRESBITERO', 'DIACONO', 'SECRETARIO'];

/**
 * Card displayed on member home page for users with admin permissions.
 * Provides quick access to the admin panel.
 */
export function AdminAccessCard({ userRole, className }: AdminAccessCardProps) {
  const normalizedRole = userRole?.toUpperCase();
  if (!normalizedRole || !ADMIN_ROLES.includes(normalizedRole)) {
    return null;
  }

  return (
    <Link
      to={ROUTES.ADMIN.ROOT}
      className={cn(
        'group relative block rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-6 transition-all duration-300',
        'hover:border-solid hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1',
        className
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-center gap-4">
        <div className="inline-flex rounded-xl p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-110">
          <Settings className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg text-slate-900 group-hover:text-indigo-900 transition-colors">
            Modo Administração
          </h3>
          <p className="mt-0.5 text-sm text-slate-500 leading-relaxed">
            Acesse o painel administrativo para gerenciar a igreja
          </p>
        </div>

        <div className="flex items-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="text-sm font-medium mr-1">Acessar</span>
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
