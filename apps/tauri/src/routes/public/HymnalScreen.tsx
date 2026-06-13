import { useMemo, useState } from "react";
import { Music, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHymns } from "@/hooks/useHymnal";

export function HymnalScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: hymns, isLoading } = useHymns();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hymns || [];
    return (hymns || []).filter(
      (h) => h.title.toLowerCase().includes(q) || String(h.number).includes(q),
    );
  }, [hymns, search]);

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in px-4 py-6 duration-300 sm:px-6">
      {/* Header */}
      <div className="mb-5 rounded-xl border border-gray-100 bg-gradient-to-r from-green-50 via-white to-emerald-50 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 shadow-md shadow-green-700/20">
            <Music size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-gray-900">Hinário</h1>
            <p className="text-xs text-gray-500">{hymns?.length ?? 0} hinos</p>
          </div>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título ou número…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-700" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">Nenhum hino encontrado.</div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {filtered.map((hymn, idx) => (
            <button
              key={hymn.number}
              onClick={() => navigate(`/hinario/${hymn.number}`)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-green-50 ${
                idx !== filtered.length - 1 ? "border-b border-gray-50" : ""
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-xs font-bold text-green-700">
                {hymn.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{hymn.title}</p>
                {hymn.author && (
                  <p className="truncate text-xs text-gray-400">{hymn.author}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
