import { useQuery } from '@tanstack/react-query';
import { bibleService } from '../../../services/bible';
import { ChevronDown } from 'lucide-react';

interface Props {
    currentVersion: string;
    onVersionChange: (version: string) => void;
}

export function BibleVersionSelector({ currentVersion, onVersionChange }: Props) {
    const { data: versions } = useQuery({
        queryKey: ['bible-versions'],
        queryFn: bibleService.getVersions,
        staleTime: Infinity
    });

    if (!versions) return null;

    return (
        <div className="relative inline-block shrink-0">
            <select
                value={currentVersion}
                onChange={(e) => onVersionChange(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium text-xs cursor-pointer hover:border-green-300 transition-colors"
                aria-label="Selecionar versão"
            >
                {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                        {v.id.toUpperCase()}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown size={14} />
            </div>
        </div>
    );
}
