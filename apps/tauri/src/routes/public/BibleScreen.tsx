import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Book, Scroll, Search, Sparkles, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBibleBooks, useBibleSearch, useBibleVersions } from "@/hooks/useBible";

const VERSION_KEY = "bible-version";
const DEFAULT_VERSION = "ARC";

export function BibleScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [version, setVersionState] = useState<string>(() => {
    return localStorage.getItem(VERSION_KEY) || DEFAULT_VERSION;
  });
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [testament, setTestament] = useState<"OT" | "NT" | "">((searchParams.get("testament") as "OT" | "NT" | "") ?? "");

  const { data: versions } = useBibleVersions();
  const { data: books, isLoading } = useBibleBooks(version);
  const { data: searchResults, isFetching: isSearching } = useBibleSearch(search, version, testament || undefined);

  const setVersion = (v: string) => {
    setVersionState(v);
    localStorage.setItem(VERSION_KEY, v);
  };

  useEffect(() => {
    const next = new URLSearchParams();
    if (search.trim()) next.set("q", search.trim());
    if (testament) next.set("testament", testament);
    setSearchParams(next, { replace: true });
  }, [search, testament, setSearchParams]);

  const oldTestament = useMemo(() => (books || []).filter((b) => b.testament === "OT" || b.testament === "old"), [books]);
  const newTestament = useMemo(() => (books || []).filter((b) => b.testament === "NT" || b.testament === "new"), [books]);

  const isSearchActive = search.trim().length >= 2;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header card */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-xl border border-green-100 shadow-lg shadow-green-100/40">
          <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 px-6 py-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700 shadow-sm">
                  <Sparkles size={12} />
                  Bíblia Online
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">Bíblia Sagrada</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Leia por livro, busque por palavra-chave e navegue direto ao capítulo.
                </p>
              </div>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
              >
                {versions?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.abbreviation || v.id} — {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por palavra, tema ou expressão"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              <select
                value={testament}
                onChange={(e) => setTestament(e.target.value as "OT" | "NT" | "")}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Toda a Bíblia</option>
                <option value="OT">Antigo Testamento</option>
                <option value="NT">Novo Testamento</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search results card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Busca rápida</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {isSearchActive
                ? `${searchResults?.total ?? 0} resultado(s) para "${search.trim()}"`
                : "Digite ao menos 2 caracteres para buscar."}
            </p>
          </div>
          <div className="p-4">
            {!isSearchActive ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                Exemplos:{" "}
                <span className="font-medium text-gray-700">amor</span>,{" "}
                <span className="font-medium text-gray-700">fé</span>,{" "}
                <span className="font-medium text-gray-700">misericórdia</span>
              </div>
            ) : isSearching ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                Buscando referências...
              </div>
            ) : searchResults?.results?.length ? (
              <div className="space-y-2">
                {searchResults.results.slice(0, 8).map((result) => (
                  <button
                    key={`${result.book_abbrev}-${result.chapter}-${result.verse}`}
                    onClick={() => navigate(`/biblia/${version}/${result.book_abbrev}/${result.chapter}`)}
                    className="flex w-full items-start justify-between gap-2 rounded-xl border border-gray-200 p-3 text-left transition hover:border-green-200 hover:bg-green-50/60"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-green-700">{result.reference}</div>
                      <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-700">
                        <span className="font-semibold">{result.verse}</span> {result.text}
                      </div>
                    </div>
                    <ArrowRight size={13} className="mt-0.5 shrink-0 text-gray-400" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                Nenhum versículo encontrado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Books grid */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <div className="mb-5 flex items-center gap-3 border-b border-gray-200 pb-3">
            <Scroll className="text-green-700" size={18} />
            <h2 className="font-serif text-xl font-bold text-gray-800">Antigo Testamento</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {oldTestament.map((book) => (
              <button
                key={book.abbrev}
                onClick={() => navigate(`/biblia/${version}/${book.abbrev}/1`)}
                className="group flex items-center justify-between gap-2 rounded-lg border border-transparent p-3 text-left transition-all hover:border-green-200 hover:bg-green-50"
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-700 group-hover:text-green-900">
                  {book.name}
                </span>
                <span className="shrink-0 whitespace-nowrap rounded-full border border-gray-100 bg-white/50 px-1.5 py-0.5 text-xs text-gray-500">
                  {book.chapters_count} cap
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-5 flex items-center gap-3 border-b border-gray-200 pb-3">
            <Book className="text-green-700" size={18} />
            <h2 className="font-serif text-xl font-bold text-gray-800">Novo Testamento</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {newTestament.map((book) => (
              <button
                key={book.abbrev}
                onClick={() => navigate(`/biblia/${version}/${book.abbrev}/1`)}
                className="group flex items-center justify-between gap-2 rounded-lg border border-transparent p-3 text-left transition-all hover:border-green-200 hover:bg-green-50"
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-700 group-hover:text-green-900">
                  {book.name}
                </span>
                <span className="shrink-0 whitespace-nowrap rounded-full border border-gray-100 bg-white/50 px-1.5 py-0.5 text-xs text-gray-500">
                  {book.chapters_count} cap
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
