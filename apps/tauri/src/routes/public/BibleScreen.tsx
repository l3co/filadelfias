import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBibleBooks, useBibleSearch, useBibleVersions } from "@/hooks/useBible";

const DEFAULT_VERSION = "ARC";

export function BibleScreen() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(DEFAULT_VERSION);
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<"OT" | "NT" | "">("");
  const { data: versions } = useBibleVersions();
  const { data: books, isLoading } = useBibleBooks(version);
  const { data: searchData, isFetching: isSearching } = useBibleSearch(search, version, testament || undefined);

  const oldTestament = useMemo(
    () => (books || []).filter((book) => book.testament === "OT" || book.testament === "old"),
    [books],
  );
  const newTestament = useMemo(
    () => (books || []).filter((book) => book.testament === "NT" || book.testament === "new"),
    [books],
  );

  const isSearchActive = search.trim().length >= 2;

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <select
          value={version}
          onChange={(event) => setVersion(event.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          {versions?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.abbreviation} - {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar versículos..."
            className="w-full rounded-md border bg-background py-1.5 pl-8 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={testament}
          onChange={(event) => setTestament(event.target.value as "OT" | "NT" | "")}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          <option value="">Toda</option>
          <option value="OT">AT</option>
          <option value="NT">NT</option>
        </select>
      </div>

      {isSearchActive ? (
        <div className="space-y-2">
          {isSearching ? (
            <p className="text-sm text-muted-foreground">Buscando...</p>
          ) : searchData?.results.length ? (
            <>
              <p className="text-xs text-muted-foreground">{searchData.total} resultado(s)</p>
              {searchData.results.map((result) => (
                <button
                  key={`${result.book_abbrev}-${result.chapter}-${result.verse}`}
                  onClick={() => navigate(`/biblia/${version}/${result.book_abbrev}/${result.chapter}`)}
                  className="flex w-full items-start justify-between gap-2 rounded-md border p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-primary">{result.reference}</p>
                    <p className="mt-0.5 line-clamp-3 text-sm leading-relaxed">
                      <span className="font-semibold">{result.verse}</span> {result.text}
                    </p>
                  </div>
                  <ArrowRight size={14} className="mt-1 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum versículo encontrado.</p>
          )}
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Antigo Testamento</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {oldTestament.map((book) => (
                <button
                  key={book.abbrev}
                  onClick={() => navigate(`/biblia/${version}/${book.abbrev}/1`)}
                  className="rounded-md border p-2 text-center text-sm transition-colors hover:bg-muted"
                >
                  {book.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Novo Testamento</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {newTestament.map((book) => (
                <button
                  key={book.abbrev}
                  onClick={() => navigate(`/biblia/${version}/${book.abbrev}/1`)}
                  className="rounded-md border p-2 text-center text-sm transition-colors hover:bg-muted"
                >
                  {book.name}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
