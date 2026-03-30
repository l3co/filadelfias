import { Mail, Phone } from "lucide-react";
import { useParams } from "react-router-dom";
import { useMember } from "@/hooks/useMembers";

export function MemberDetailScreen() {
  const { memberId } = useParams<{ memberId: string }>();
  const { data: member, isLoading } = useMember(memberId);

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Carregando membro...</div>;
  }

  if (!member) {
    return <div className="p-4 text-sm text-muted-foreground">Membro nao encontrado.</div>;
  }

  return (
    <div className="space-y-5 p-4">
      <div className="flex flex-col items-center rounded-2xl border bg-card p-6 text-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold">{member.name}</h1>
        <p className="text-sm text-muted-foreground">{member.office || "Membro"}</p>
      </div>

      <div className="space-y-3">
        {member.email ? (
          <a href={`mailto:${member.email}`} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <Mail size={18} className="text-primary" />
            <span className="text-sm">{member.email}</span>
          </a>
        ) : null}

        {member.phone ? (
          <a href={`tel:${member.phone}`} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <Phone size={18} className="text-primary" />
            <span className="text-sm">{member.phone}</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
