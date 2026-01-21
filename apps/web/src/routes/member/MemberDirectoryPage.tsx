import { Users, Search, Filter, Phone, Mail } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMembers } from '../../features/members/hooks/useMembers';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

const officeFilters = [
  { value: 'all', label: 'Todos', color: 'bg-slate-100 text-slate-700' },
  { value: 'PASTOR', label: 'Pastores', color: 'bg-purple-100 text-purple-700' },
  { value: 'PRESBITERO', label: 'Presbíteros', color: 'bg-blue-100 text-blue-700' },
  { value: 'DIACONO', label: 'Diáconos', color: 'bg-amber-100 text-amber-700' },
  { value: 'MEMBRO', label: 'Membros', color: 'bg-emerald-100 text-emerald-700' },
];

const officeLabels: Record<string, { label: string; color: string; gradient: string }> = {
  PASTOR: { label: 'Pastor', color: 'bg-purple-100 text-purple-700', gradient: 'from-purple-500 to-violet-600' },
  PRESBITERO: { label: 'Presbítero', color: 'bg-blue-100 text-blue-700', gradient: 'from-blue-500 to-indigo-600' },
  DIACONO: { label: 'Diácono', color: 'bg-amber-100 text-amber-700', gradient: 'from-amber-500 to-orange-600' },
  MEMBRO: { label: 'Membro', color: 'bg-emerald-100 text-emerald-700', gradient: 'from-emerald-500 to-teal-600' },
};

export function MemberDirectoryPage() {
  const tenant = useCurrentTenant();
  const { data: members, isLoading } = useMembers(tenant?.id || '');
  const [search, setSearch] = useState('');
  const [officeFilter, setOfficeFilter] = useState('all');

  const filteredMembers = useMemo(() => {
    return members?.filter(member => {
      const matchesSearch = member.full_name.toLowerCase().includes(search.toLowerCase());
      const matchesOffice = officeFilter === 'all' || member.office === officeFilter;
      return matchesSearch && matchesOffice;
    }) || [];
  }, [members, search, officeFilter]);

  // Agrupar por cargo para contagem
  const officeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: members?.length || 0 };
    members?.forEach(m => {
      const office = m.office || 'MEMBRO';
      counts[office] = (counts[office] || 0) + 1;
    });
    return counts;
  }, [members]);

  const getOfficeInfo = (office?: string) => {
    return officeLabels[office || 'MEMBRO'] || officeLabels.MEMBRO;
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <PageHeaderWithIcon
          icon={Users}
          title="Diretório de Membros"
          description="Carregando..."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeaderWithIcon
        icon={Users}
        title="Diretório de Membros"
        description="Conheça os irmãos da nossa comunidade"
      />

      {/* Search & Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        {/* Office Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          {officeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setOfficeFilter(filter.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                officeFilter === filter.value
                  ? `${filter.color} ring-2 ring-offset-1 ring-current/20`
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {filter.label}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-md",
                officeFilter === filter.value ? "bg-white/50" : "bg-slate-200/50"
              )}>
                {officeCounts[filter.value] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-slate-500 mb-4">
        {filteredMembers.length} {filteredMembers.length === 1 ? 'membro encontrado' : 'membros encontrados'}
      </p>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum membro encontrado"
          description={search || officeFilter !== 'all' ? "Tente ajustar os filtros" : "Não há membros cadastrados ainda"}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            const officeInfo = getOfficeInfo(member.office);
            return (
              <div
                key={member.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    officeInfo.gradient
                  )}>
                    <span className="text-white font-bold text-xl">
                      {member.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                      {member.full_name}
                    </h3>
                    <Badge className={cn("mt-1 font-medium", officeInfo.color)}>
                      {officeInfo.label}
                    </Badge>
                  </div>
                </div>
                
                {/* Contact Info */}
                {(member.phone || member.email) && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="truncate">{member.phone}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
