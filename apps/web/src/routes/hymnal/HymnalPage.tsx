import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hymnalService } from '../../services/hymnal';
import { Music, Search } from 'lucide-react';
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

    const filteredHymns = hymns?.filter(h =>
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.number.toString().includes(search) ||
        h.author.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-3">
                    <Music className="text-green-700" size={32} />
                    Novo Cântico
                </h1>
                <p className="text-lg text-gray-500">Hinário Presbiteriano</p>
            </div>

            {/* Search */}
            <div className="relative mb-8 max-w-xl mx-auto">
                <input
                    type="text"
                    placeholder="Buscar por número, título ou autor..."
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm transition-shadow"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredHymns.map((hymn) => (
                    <Link
                        key={hymn.number}
                        to={`/hymnal/${hymn.number}`}
                        className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-green-100 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="flex items-center justify-center w-10 h-10 bg-green-50 text-green-700 font-bold rounded-full group-hover:bg-green-700 group-hover:text-white transition-colors">
                                {hymn.number}
                            </span>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg group-hover:text-green-700 transition-colors">{hymn.title}</h3>
                                <p className="text-sm text-gray-500">{hymn.author}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredHymns.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                    Nenhum hino encontrado.
                </div>
            )}
        </div>
    )
}
