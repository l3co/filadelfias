import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hymnalService } from '../../services/hymnal';
import { ArrowLeft, Music } from 'lucide-react';

export function HymnalReaderPage() {
    const { number } = useParams();
    const hymnNum = parseInt(number || '1');

    const { data: hymn, isLoading, isError } = useQuery({
        queryKey: ['hymn', hymnNum],
        queryFn: () => hymnalService.getHymn(hymnNum),
        enabled: !!number
    });

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isError || !hymn) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">Hino não encontrado</h2>
                <Link to="/hymnal" className="text-indigo-600 hover:underline">Voltar para índice</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 relative">
            <Link to="/hymnal" className="absolute top-8 left-4 lg:-left-16 p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                <ArrowLeft size={24} />
            </Link>

            <div className="text-center mb-10 mt-4">
                <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full mb-3 text-sm">
                    Hino {hymn.number}
                </div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{hymn.title}</h1>
                <p className="text-gray-500 italic font-serif">{hymn.author}</p>
            </div>

            <div className="prose prose-lg prose-indigo mx-auto text-center font-serif leading-relaxed text-gray-800 bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-50">
                {hymn.lyrics.map((line, idx) => (
                    <p key={idx} className={`mb-0 ${line === '' ? 'h-6' : ''}`}>
                        {line || <br />}
                    </p>
                ))}
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                Novo Cântico - Hinário Presbiteriano
            </div>
        </div>
    )
}
