import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Scroll, Book, Search, ArrowRight, Sparkles } from 'lucide-react';
import { useBibleVersion } from '../../hooks/useBibleVersion';
import { BibleVersionSelector } from '../../features/bible/components/BibleVersionSelector';
import { ROUTES } from '../../lib/routes';
import { useBibleBooks, useBibleSearch } from '../../hooks/useBible';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export function BiblePage() {
    const { version, setVersion } = useBibleVersion();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('q') ?? '');
    const [testament, setTestament] = useState<'OT' | 'NT' | ''>((searchParams.get('testament') as 'OT' | 'NT' | '') ?? '');

    const { data: books, isLoading } = useBibleBooks(version);
    const { data: searchResults, isFetching: isSearching } = useBibleSearch(
        search,
        version,
        testament || undefined
    );

    useEffect(() => {
        const nextParams = new URLSearchParams();
        if (search.trim()) nextParams.set('q', search.trim());
        if (testament) nextParams.set('testament', testament);
        setSearchParams(nextParams, { replace: true });
    }, [search, testament, setSearchParams]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    const oldTestament = books?.filter(b => b.testament === 'old') || [];
    const newTestament = books?.filter(b => b.testament === 'new') || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] mb-12">
                <Card className="overflow-hidden border-green-100 shadow-lg shadow-green-100/40">
                    <CardHeader className="bg-gradient-to-br from-green-50 via-white to-emerald-50">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700 shadow-sm">
                                    <Sparkles size={14} />
                                    Bíblia Online
                                </div>
                                <CardTitle className="mt-4 text-4xl font-extrabold text-gray-900">
                                    Bíblia Sagrada
                                </CardTitle>
                                <CardDescription className="mt-2 max-w-2xl text-base text-gray-600">
                                    Leia por livro, encontre referências por palavra-chave e navegue direto para o capítulo.
                                </CardDescription>
                            </div>
                            <BibleVersionSelector currentVersion={version} onVersionChange={setVersion} />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto]">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="pl-9"
                                    placeholder="Buscar por palavra, tema ou expressão"
                                />
                            </div>
                            <select
                                value={testament}
                                onChange={(event) => setTestament(event.target.value as 'OT' | 'NT' | '')}
                                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
                            >
                                <option value="">Toda a Bíblia</option>
                                <option value="OT">Antigo Testamento</option>
                                <option value="NT">Novo Testamento</option>
                            </select>
                            <Button variant="outline" onClick={() => { setSearch(''); setTestament(''); }}>
                                Limpar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Busca rápida</CardTitle>
                        <CardDescription>
                            {search.trim().length >= 2
                                ? `${searchResults?.total ?? 0} resultados para "${search.trim()}"`
                                : 'Digite ao menos 2 caracteres para buscar.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {search.trim().length < 2 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                Exemplos: <span className="font-medium text-gray-700">amor</span>, <span className="font-medium text-gray-700">fé</span>, <span className="font-medium text-gray-700">misericórdia</span>
                            </div>
                        ) : isSearching ? (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                Buscando referências...
                            </div>
                        ) : searchResults?.results?.length ? (
                            <div className="space-y-3">
                                {searchResults.results.slice(0, 8).map((result) => (
                                    <Link
                                        key={`${result.book_abbrev}-${result.chapter}-${result.verse}`}
                                        to={ROUTES.PUBLIC.BIBLE_READER(result.book_abbrev, result.chapter)}
                                        className="block rounded-xl border border-gray-200 p-4 transition hover:border-green-200 hover:bg-green-50/60"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-green-700">{result.reference}</div>
                                                <div className="mt-1 line-clamp-3 text-sm leading-6 text-gray-700">
                                                    <span className="font-semibold">{result.verse}</span> {result.text}
                                                </div>
                                            </div>
                                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                Nenhum versículo encontrado para essa busca.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
                        <Scroll className="text-green-700" />
                        <h2 className="text-2xl font-serif font-bold text-gray-800">Antigo Testamento</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {oldTestament.map((book) => (
                            <Link
                                key={book.abbrev}
                                to={ROUTES.PUBLIC.BIBLE_READER(book.abbrev, 1)}
                                className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-green-100 border border-transparent hover:border-green-200 transition-all group w-full"
                            >
                                <span className="font-medium text-gray-700 group-hover:text-green-900 text-left whitespace-nowrap overflow-hidden text-ellipsis">{book.name}</span>
                                <span className="text-xs text-gray-500 bg-white/50 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap border border-gray-100">{book.chapters_count} cap</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
                        <Book className="text-green-700" />
                        <h2 className="text-2xl font-serif font-bold text-gray-800">Novo Testamento</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {newTestament.map((book) => (
                            <Link
                                key={book.abbrev}
                                to={ROUTES.PUBLIC.BIBLE_READER(book.abbrev, 1)}
                                className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-green-100 border border-transparent hover:border-green-200 transition-all group w-full"
                            >
                                <span className="font-medium text-gray-700 group-hover:text-green-900 text-left whitespace-nowrap overflow-hidden text-ellipsis">{book.name}</span>
                                <span className="text-xs text-gray-500 bg-white/50 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap border border-gray-100">{book.chapters_count} cap</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
