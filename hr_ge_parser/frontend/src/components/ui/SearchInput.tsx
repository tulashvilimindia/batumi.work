import { useState, useEffect, type ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { DEBOUNCE_DELAY } from '@/utils/constants';

// ============================================================
// TYPES
// ============================================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounce?: boolean;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounce = true,
  className = '',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (!debounce) return;

    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [internalValue, debounce, onChange, value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (!debounce) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
