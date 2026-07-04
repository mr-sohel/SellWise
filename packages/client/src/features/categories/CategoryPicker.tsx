import { useState, useRef, useEffect } from 'react';
import { useCategories } from './hooks/useCategories';
import { Plus, ChevronDown, X } from 'lucide-react';

interface CategoryPickerProps {
  storeId: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CategoryPicker({ storeId, value, onChange, error }: CategoryPickerProps) {
  const { data: categories = [] } = useCategories(storeId);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = categories.some(c => c.name.toLowerCase() === search.toLowerCase());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectCategory = (name: string) => {
    onChange(name);
    setSearch(name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`flex h-10 w-full rounded-md border bg-card px-3 py-2 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground ${
            error ? 'border-destructive' : 'border-input'
          }`}
          placeholder="Select or type a category..."
        />
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setSearch(''); }}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-vercel-5 py-1 max-h-48 overflow-auto">
          {filtered.length > 0 && filtered.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.name)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                value === cat.name ? 'bg-canvas-soft font-medium text-foreground' : 'text-foreground hover:bg-muted'
              }`}
            >
              {cat.name}
              {cat.name_bn && <span className="text-muted-foreground ml-2 text-xs">{cat.name_bn}</span>}
            </button>
          ))}

          {search && !exactMatch && (
            <button
              type="button"
              onClick={() => selectCategory(search)}
              className="w-full text-left px-3 py-2 text-sm text-link hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Use "{search}"
            </button>
          )}

          {filtered.length === 0 && !search && (
            <div className="px-3 py-3 text-sm text-muted-foreground text-center">
              No categories yet. Type to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
