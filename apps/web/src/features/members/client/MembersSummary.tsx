import { use } from 'react';
import { Mail, ShieldCheck, Users } from 'lucide-react';
import { getMembersPromise } from '../data/members.data';

interface MembersSummaryProps {
  refreshKey?: string;
  tenantId: string;
}

export function MembersSummary({ refreshKey, tenantId }: MembersSummaryProps) {
  const members = use(getMembersPromise(tenantId, refreshKey));
  const invitedMembers = members.filter((member) => !!member.user_id).length;
  const membersWithEmail = members.filter((member) => !!member.email).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-sky-700">
          <Users size={16} />
          <span className="text-sm font-medium">Base de membros</span>
        </div>
        <p className="text-2xl font-semibold text-sky-950">{members.length}</p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-emerald-700">
          <ShieldCheck size={16} />
          <span className="text-sm font-medium">Acessos ativos</span>
        </div>
        <p className="text-2xl font-semibold text-emerald-950">{invitedMembers}</p>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-amber-700">
          <Mail size={16} />
          <span className="text-sm font-medium">Contatos com e-mail</span>
        </div>
        <p className="text-2xl font-semibold text-amber-950">{membersWithEmail}</p>
      </div>
    </div>
  );
}
