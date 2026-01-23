import { Gavel, Users, Landmark } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useGovernance } from '../../features/governance/hooks/useGovernance';
import { useMembers } from '../../features/members/hooks/useMembers';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CardSkeleton } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import type { Council } from '../../services/governance';

const typeLabels: Record<string, string> = {
  SESSION: 'Conselho',
  DEACONS: 'Junta Diaconal',
  ASSEMBLY: 'Assembleia',
  COMMITTEE: 'Comissão',
};

const typeColors: Record<string, string> = {
  SESSION: 'from-purple-500 to-indigo-600',
  DEACONS: 'from-blue-500 to-cyan-600',
  ASSEMBLY: 'from-emerald-500 to-teal-600',
  COMMITTEE: 'from-orange-500 to-amber-600',
};

const getIcon = (type: string) => {
  switch (type) {
    case 'SESSION': return <Gavel size={20} />;
    case 'ASSEMBLY': return <Users size={20} />;
    default: return <Landmark size={20} />;
  }
};

interface CouncilCardProps {
  council: Council;
  memberNames: Record<string, string>;
}

function CouncilCard({ council, memberNames }: CouncilCardProps) {
  const memberIds = council.member_ids || [];
  const gradientClass = typeColors[council.type] || 'from-gray-500 to-gray-600';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className={`h-20 bg-gradient-to-r ${gradientClass} p-4 flex items-center gap-3`}>
        <div className="p-2 bg-white/20 rounded-lg text-white">
          {getIcon(council.type)}
        </div>
        <div className="text-white">
          <h3 className="font-semibold text-lg">{council.name}</h3>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
            {typeLabels[council.type] || council.type}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {council.description && (
          <p className="text-sm text-gray-600 mb-4">{council.description}</p>
        )}

        {/* Members */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Users size={14} />
            Membros ({memberIds.length})
          </h4>
          
          {memberIds.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Nenhum membro vinculado</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {memberIds.map((memberId) => (
                <div
                  key={memberId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                    {(memberNames[memberId] || '?').charAt(0)}
                  </div>
                  <span className="text-sm text-gray-700">
                    {memberNames[memberId] || 'Membro'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MemberGovernancePage() {
  const tenant = useCurrentTenant();
  const { data: councils, isLoading: isLoadingCouncils } = useGovernance(tenant?.id);
  const { data: members } = useMembers(tenant?.id);

  // Create a map of member IDs to names
  const memberNames: Record<string, string> = {};
  members?.forEach((m) => {
    memberNames[m.id] = m.full_name;
  });

  if (isLoadingCouncils) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Governança</h1>
          <p className="text-gray-500 mt-1">Conheça os órgãos de liderança da nossa igreja</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!councils || councils.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Governança</h1>
          <p className="text-gray-500 mt-1">Conheça os órgãos de liderança da nossa igreja</p>
        </div>
        <EmptyState
          icon={Gavel}
          title="Nenhum órgão cadastrado"
          description="Os órgãos de governança ainda não foram configurados."
        />
      </div>
    );
  }

  // Group councils by type
  const sections = [
    { title: 'Conselhos e Juntas', types: ['SESSION', 'DEACONS'], icon: Gavel },
    { title: 'Assembleias', types: ['ASSEMBLY'], icon: Users },
    { title: 'Comissões', types: ['COMMITTEE'], icon: Landmark },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50">
            <Gavel className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Governança</h1>
        </div>
        <p className="text-gray-500">
          Conheça os órgãos de liderança e seus membros na {tenant?.name}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section) => {
          const sectionCouncils = councils.filter((c) => section.types.includes(c.type));
          if (sectionCouncils.length === 0) return null;

          return (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <section.icon size={18} className="text-gray-400" />
                {section.title}
                <Badge variant="secondary" className="ml-2">{sectionCouncils.length}</Badge>
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {sectionCouncils.map((council) => (
                  <CouncilCard
                    key={council.id}
                    council={council}
                    memberNames={memberNames}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
