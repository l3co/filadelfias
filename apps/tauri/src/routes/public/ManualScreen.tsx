import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useManualStructure } from "@/hooks/useManual";

export function ManualScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useManualStructure();

  const filteredParts = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return data.parts;
    }

    return data.parts
      .map((part) => ({
        ...part,
        chapters: part.chapters
          .map((chapter) => ({
            ...chapter,
            articles: chapter.articles.filter(
              (article) =>
                article.number.toLowerCase().includes(normalizedSearch) ||
                chapter.title.toLowerCase().includes(normalizedSearch) ||
                part.title.toLowerCase().includes(normalizedSearch),
            ),
            sections: chapter.sections
              .map((section) => ({
                ...section,
                articles: section.articles.filter(
                  (article) =>
                    article.number.toLowerCase().includes(normalizedSearch) ||
                    section.title.toLowerCase().includes(normalizedSearch) ||
                    chapter.title.toLowerCase().includes(normalizedSearch),
                ),
              }))
              .filter((section) => section.articles.length > 0 || section.title.toLowerCase().includes(normalizedSearch)),
          }))
          .filter(
            (chapter) =>
              chapter.articles.length > 0 ||
              chapter.sections.length > 0 ||
              chapter.title.toLowerCase().includes(normalizedSearch),
          ),
      }))
      .filter((part) => part.chapters.length > 0 || part.title.toLowerCase().includes(normalizedSearch));
  }, [data, search]);

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Carregando...</div>;
  }

  if (!data) {
    return <div className="p-4 text-muted-foreground">Estrutura do manual indisponivel.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">{data.metadata.title}</h1>
        <p className="text-sm text-muted-foreground">
          Edicao {data.metadata.editionYear} · {data.total_articles} artigos
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por artigo, capitulo ou parte..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
        />
      </div>

      <div className="space-y-6">
        {filteredParts.map((part) => (
          <section key={part.id} className="rounded-xl border p-4">
            <h2 className="mb-3 text-lg font-semibold">{part.title}</h2>

            <div className="space-y-4">
              {part.chapters.map((chapter) => (
                <div key={chapter.id} className="rounded-lg bg-muted/30 p-4">
                  <h3 className="font-medium">
                    {chapter.number}. {chapter.title}
                  </h3>

                  {chapter.articles.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chapter.articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => navigate(`/manual/${article.id}`)}
                          className="rounded-md border px-3 py-1 text-sm transition-colors hover:bg-background"
                        >
                          Art. {article.number}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {chapter.sections.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {chapter.sections.map((section) => (
                        <div key={section.id} className="rounded-md border bg-background p-3">
                          <p className="mb-2 text-sm font-medium">
                            {section.number}. {section.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {section.articles.map((article) => (
                              <button
                                key={article.id}
                                onClick={() => navigate(`/manual/${article.id}`)}
                                className="rounded-md border px-3 py-1 text-sm transition-colors hover:bg-muted"
                              >
                                Art. {article.number}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
