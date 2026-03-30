import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBibleBooks, useBibleVersions } from "@/hooks/useBible";

const DEFAULT_VERSION = "ARC";

export function BibleScreen() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(DEFAULT_VERSION);
  const { data: versions } = useBibleVersions();
  const { data: books, isLoading } = useBibleBooks(version);

  const oldTestament = useMemo(
    () => (books || []).filter((book) => book.testament === "OT" || book.testament === "old"),
    [books],
  );
  const newTestament = useMemo(
    () => (books || []).filter((book) => book.testament === "NT" || book.testament === "new"),
    [books],
  );

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6 p-4">
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
    </div>
  );
}
