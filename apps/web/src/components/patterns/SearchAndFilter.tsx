import { Search, X } from 'lucide-react';
import { Badge } from '../ui/badge';

interface SearchFilterOption<T extends string | null> {
  key: T;
  label: string;
  count?: number;
}

interface SearchAndFilterProps<T extends string | null> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  searchPlaceholder?: string;
  filters: SearchFilterOption<T>[];
  activeFilter: T;
  onFilterChange: (value: T) => void;
}

export function SearchAndFilter<T extends string | null>({
  searchValue,
  onSearchChange,
  onClearSearch,
  searchPlaceholder = 'Buscar...',
  filters,
  activeFilter,
  onFilterChange,
}: SearchAndFilterProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400"
          />
          {searchValue && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => onFilterChange(filter.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              {typeof filter.count === 'number' && (
                <Badge variant="secondary" className={isActive ? 'ml-2 bg-white/20' : 'ml-2'}>
                  {filter.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
