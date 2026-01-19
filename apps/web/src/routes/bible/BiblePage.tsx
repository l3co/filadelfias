import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bibleService } from '../../services/bible';
import { Scroll, Book } from 'lucide-react';
import { useBibleVersion } from '../../hooks/useBibleVersion';
import { BibleVersionSelector } from '../../features/bible/components/BibleVersionSelector';

export function BiblePage() {
    const { version, setVersion } = useBibleVersion();

    const { data: books, isLoading } = useQuery({
        queryKey: ['bible-books', version],
        queryFn: () => bibleService.getBooks(version)
    });

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
            <div className="text-center mb-12 flex flex-col items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Bíblia Sagrada</h1>
                    <p className="text-lg text-gray-500">Selecione um livro para iniciar sua leitura</p>
                </div>
                <BibleVersionSelector currentVersion={version} onVersionChange={setVersion} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Old Testament */}
                <div>
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
                        <Scroll className="text-green-700" />
                        <h2 className="text-2xl font-serif font-bold text-gray-800">Antigo Testamento</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {oldTestament.map((book) => (
                            <Link
                                key={book.abbrev}
                                to={`/bible/${book.abbrev}/1`}
                                className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-green-100 border border-transparent hover:border-green-200 transition-all group w-full"
                            >
                                <span className="font-medium text-gray-700 group-hover:text-green-900 text-left whitespace-nowrap overflow-hidden text-ellipsis">{book.name}</span>
                                <span className="text-xs text-gray-500 bg-white/50 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap border border-gray-100">{book.chapters_count} cap</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* New Testament */}
                <div>
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
                        <Book className="text-green-700" />
                        <h2 className="text-2xl font-serif font-bold text-gray-800">Novo Testamento</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {newTestament.map((book) => (
                            <Link
                                key={book.abbrev}
                                to={`/bible/${book.abbrev}/1`}
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
