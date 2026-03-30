import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMembers } from "@/hooks/useMembers";

export function DirectoryScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: members, isLoading } = useMembers(search);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Diretorio</h1>
        <p className="text-sm text-muted-foreground">Encontre irmaos e liderancas da igreja.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar membro..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-md border bg-background py-2 pr-3 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando membros...</p>
      ) : (
        <div className="space-y-2">
          {members?.map((member) => (
            <button
              key={member.id}
              onClick={() => navigate(`/member/directory/${member.id}`)}
              className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.office || "Membro"}</p>
              </div>
            </button>
          ))}

          {!members?.length ? <p className="text-sm text-muted-foreground">Nenhum membro encontrado.</p> : null}
        </div>
      )}
    </div>
  );
}
