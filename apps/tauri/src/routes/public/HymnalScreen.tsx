import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHymns } from "@/hooks/useHymnal";

export function HymnalScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: hymns, isLoading } = useHymns();

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return (hymns || []).filter(
      (hymn) =>
        hymn.title.toLowerCase().includes(normalizedSearch) || String(hymn.number).includes(normalizedSearch),
    );
  }, [hymns, search]);

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar hino..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((hymn) => (
            <button
              key={hymn.number}
              onClick={() => navigate(`/hinario/${hymn.number}`)}
              className="flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted"
            >
              <span className="w-8 text-right text-sm font-bold text-primary">{hymn.number}</span>
              <div>
                <p className="text-sm font-medium">{hymn.title}</p>
                {hymn.author ? <p className="text-xs text-muted-foreground">{hymn.author}</p> : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
