import { Search } from "lucide-react";
import { useState } from "react";
import { useMembers } from "@/hooks/useMembers";

export function MemberManagementScreen() {
  const [search, setSearch] = useState("");
  const { data: members, isLoading } = useMembers(search);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Gestao de membros</h1>
        <p className="text-sm text-muted-foreground">Consulte rapidamente membros, oficios e contatos.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar membro..."
          className="w-full rounded-md border bg-background py-2 pr-3 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando membros...</p>
      ) : (
        <div className="space-y-2">
          {members?.map((member) => (
            <article key={member.id} className="rounded-2xl border bg-card p-4">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.office || "Membro"}</p>
              {member.email ? <p className="mt-1 text-sm text-muted-foreground">{member.email}</p> : null}
              {member.phone ? <p className="text-sm text-muted-foreground">{member.phone}</p> : null}
            </article>
          ))}

          {!members?.length ? (
            <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
              Nenhum membro encontrado.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
