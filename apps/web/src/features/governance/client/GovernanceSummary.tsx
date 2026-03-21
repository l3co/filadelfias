import { use } from 'react';
import { Gavel, Landmark, Users } from 'lucide-react';
import { getCouncilsPromise } from '../data/governance.data';

interface GovernanceSummaryProps {
  refreshKey?: string;
  tenantId: string;
}

export function GovernanceSummary({ refreshKey, tenantId }: GovernanceSummaryProps) {
  const councils = use(getCouncilsPromise(tenantId, refreshKey));
  const assemblyCount = councils.filter((council) => council.type === 'ASSEMBLY').length;
  const totalAssignedMembers = councils.reduce(
    (total, council) => total + (council.member_ids?.length ?? 0),
    0,
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-violet-700">
          <Landmark size={16} />
          <span className="text-sm font-medium">Órgãos ativos</span>
        </div>
        <p className="text-2xl font-semibold text-violet-950">{councils.length}</p>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-indigo-700">
          <Gavel size={16} />
          <span className="text-sm font-medium">Assembleias</span>
        </div>
        <p className="text-2xl font-semibold text-indigo-950">{assemblyCount}</p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-emerald-700">
          <Users size={16} />
          <span className="text-sm font-medium">Vínculos internos</span>
        </div>
        <p className="text-2xl font-semibold text-emerald-950">{totalAssignedMembers}</p>
      </div>
    </div>
  );
}
