import { ChevronDown, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Input from './Input';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  className?: string;
  clearable?: boolean;
}

const Select = ({ label, options, value, onChange, placeholder = 'Select...', multiple = false, searchable = false, className = '', clearable = false }: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const values = Array.isArray(value) ? value : [value];
  const hasValue = multiple ? values.length > 0 && values.some((v) => v !== '') : values.length > 0 && values[0] !== '';
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchable || search.trim() === '') {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search, searchable]);

  const toggleValue = (selected: string) => {
    if (multiple) {
      if (values.includes(selected)) {
        onChange(values.filter((v) => v !== selected));
      } else {
        onChange([...values, selected]);
      }
    } else {
      onChange(selected);
      setOpen(false);
      setSearch('');
    }
  };

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
    setSearch('');
  };

  const displayValue = () => {
    if (values.length === 0 || values[0] === '') {
      return placeholder;
    }
    if (multiple) {
      return options
        .filter((o) => values.includes(o.value))
        .map((o) => o.label)
        .join(', ');
    }
    return options.find((o) => o.value === values[0])?.label ?? placeholder;
  };

  const toggleDropdown = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 260;
      setOpenUp(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
    }
    setOpen((prev) => !prev);
    if (open) {
      setSearch('');
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <label className="mb-1 block text-sm font-medium text-calm-text">{label}</label>}

      <button
        type="button"
        onClick={toggleDropdown}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-300 bg-calm-surface px-3 py-2 text-left text-calm-text shadow-sm transition focus:border-calm-accent focus:ring-1 focus:ring-calm-accent"
      >
        <span className="truncate">{displayValue()}</span>
        <span className="ml-2 flex shrink-0 items-center gap-1">
          {clearable && hasValue ? (
            <span
              role="button"
              tabIndex={0}
              onClick={clearValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  clearValue(e as unknown as React.MouseEvent);
                }
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </span>
          ) : (
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          )}
        </span>
      </button>

      {open && (
        <div className={`absolute z-[999] max-h-64 w-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg ${openUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {searchable && (
            <div className="relative border-b border-slate-200 bg-white p-2">
              <Input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tag..." />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-52 overflow-auto pb-3">
            {filteredOptions.length === 0 && <div className="px-3 py-6 text-center text-sm text-slate-500">No results found</div>}
            {filteredOptions.map((option) => {
              const selected = values.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left transition hover:bg-slate-100 ${selected ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <span>{option.label}</span>
                  {multiple && <input type="checkbox" checked={selected} readOnly className="pointer-events-none" />}
                  {!multiple && selected && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default Select;
