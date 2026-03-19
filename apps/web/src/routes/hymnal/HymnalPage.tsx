import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hymnalService } from '../../services/hymnal';
import { Music, Search, User } from 'lucide-react';
import { useState } from 'react';

export function HymnalPage() {
    const { data: hymns, isLoading } = useQuery({
        queryKey: ['hymns'],
        queryFn: hymnalService.getHymns
    });

    const [search, setSearch] = useState('');

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    const filteredHymns = (Array.isArray(hymns) ? hymns : []).filter(h =>
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.number.toString().includes(search) ||
        (h.author || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-3">
                    <Music className="text-green-700" size={32} />
                    Novo Cântico
                </h1>
                <p className="text-lg text-gray-500">Hinário Presbiteriano</p>
            </div>

            {/* Search */}
            <div className="relative mb-12 max-w-xl mx-auto">
                <input
                    type="text"
                    placeholder="Buscar por número, título ou autor..."
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm transition-shadow"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHymns.map((hymn) => (
                    <Link
                        key={hymn.number}
                        to={`/hymnal/${hymn.number}`}
                        className="flex flex-col p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-green-100 transition-all group h-full relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Music size={64} />
                        </div>

                        <div className="flex items-start gap-4 relative z-10">
                            <span className="flex items-center justify-center w-12 h-12 bg-green-50 text-green-700 font-bold rounded-lg text-lg group-hover:bg-green-700 group-hover:text-white transition-colors shrink-0 shadow-sm border border-green-100">
                                {hymn.number}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 text-lg group-hover:text-green-700 transition-colors line-clamp-2 mb-2 leading-tight">
                                    {hymn.title}
                                </h3>
                                {hymn.author && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <User size={12} className="shrink-0" />
                                        <span className="truncate">{hymn.author}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredHymns.length === 0 && (
                <div className="text-center text-gray-500 py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p>Nenhum hino encontrado para sua busca.</p>
                </div>
            )}
        </div>
    )
}
