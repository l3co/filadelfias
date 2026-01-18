import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bibleService } from '../../services/bible';
import { Scroll, Book } from 'lucide-react';

export function BiblePage() {
    const { data: books, isLoading } = useQuery({
        queryKey: ['bible-books'],
        queryFn: bibleService.getBooks
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
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Bíblia Sagrada</h1>
                <p className="text-lg text-gray-500">Selecione um livro para iniciar sua leitura</p>
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
                                className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-100 transition-all group w-full"
                            >
                                <span className="font-medium text-gray-700 group-hover:text-green-800 text-left">{book.name}</span>
                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">{book.chapters_count} cap</span>
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
                                className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-100 transition-all group w-full"
                            >
                                <span className="font-medium text-gray-700 group-hover:text-green-800 text-left">{book.name}</span>
                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">{book.chapters_count} cap</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
