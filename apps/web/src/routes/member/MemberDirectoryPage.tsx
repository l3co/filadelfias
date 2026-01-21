import { Users, Search } from 'lucide-react';
import { useState } from 'react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMembers } from '../../features/members/hooks/useMembers';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/ui/input';
import { LoadingOverlay } from '../../components/ui/spinner';

export function MemberDirectoryPage() {
  const tenant = useCurrentTenant();
  const { data: members, isLoading } = useMembers(tenant?.id || '');
  const [search, setSearch] = useState('');

  const filteredMembers = members?.filter(member => 
    member.full_name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return <LoadingOverlay message="Carregando membros..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Diretório de Membros" 
        description="Conheça os irmãos da nossa igreja"
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum membro encontrado"
          description={search ? "Tente buscar por outro nome" : "Não há membros cadastrados ainda"}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {member.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{member.full_name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.office?.toLowerCase() || 'Membro'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
