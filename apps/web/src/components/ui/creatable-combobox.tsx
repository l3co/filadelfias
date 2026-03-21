import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface CreatableComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  onCreateNew?: (name: string) => Promise<ComboboxOption | void>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  createMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function CreatableCombobox({
  options,
  value,
  onChange,
  onCreateNew,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado encontrado.',
  createMessage = 'Criar',
  disabled = false,
  className,
}: CreatableComboboxProps) {
  const searchInputId = useRef(`creatable-combobox-search-${Math.random().toString(36).slice(2, 9)}`);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const showCreateOption =
    onCreateNew &&
    search.trim() !== '' &&
    !options.some((opt) => opt.label.toLowerCase() === search.toLowerCase());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
    setSearch('');
  };

  const handleCreate = async () => {
    if (!onCreateNew || !search.trim()) return;

    setIsCreating(true);
    try {
      const newOption = await onCreateNew(search.trim());
      if (newOption) {
        onChange(newOption.value);
      }
      setSearch('');
      setOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showCreateOption) {
        handleCreate();
      } else if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0].value);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? `${searchInputId.current}-listbox` : undefined}
        aria-label={selectedOption?.label ? `Selecionado: ${selectedOption.label}` : placeholder}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          open && 'ring-2 ring-green-500'
        )}
      >
        <span className={cn(!selectedOption && 'text-gray-400')}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100">
            <label htmlFor={searchInputId.current} className="sr-only">
              {searchPlaceholder}
            </label>
            <input
              id={searchInputId.current}
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full rounded-md px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          <div id={`${searchInputId.current}-listbox`} role="listbox" className="max-h-60 overflow-auto p-1">
            {filteredOptions.length === 0 && !showCreateOption && (
              <div className="py-6 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            )}

            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                  'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500',
                  value === option.value && 'bg-green-50 text-green-700'
                )}
              >
                <Check
                  className={cn(
                    'h-4 w-4',
                    value === option.value ? 'opacity-100' : 'opacity-0'
                  )}
                  aria-hidden="true"
                />
                {option.label}
              </button>
            ))}

            {showCreateOption && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                  'hover:bg-green-50 focus:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500',
                  'text-green-600 font-medium',
                  isCreating && 'opacity-50 cursor-wait'
                )}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {isCreating ? 'Criando...' : `${createMessage} "${search}"`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
