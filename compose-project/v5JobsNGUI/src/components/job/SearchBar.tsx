/**
 * SearchBar Component
 * Search input with debounce functionality
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/ui';
import type { Language } from '@/components/ui';

export interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Change handler - called with debounced value */
  onChange: (value: string) => void;
  /** Search submit handler */
  onSearch?: () => void;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

// Translations
const translations = {
  ge: {
    placeholder: 'ძიება...',
    searchJobs: 'ვაკანსიების ძიება',
  },
  en: {
    placeholder: 'Search jobs, companies...',
    searchJobs: 'Search jobs',
  },
};

/**
 * SearchBar with debounced input for job search
 */
export function SearchBar({
  value,
  onChange,
  onSearch,
  debounceMs = 300,
  disabled = false,
  className,
}: SearchBarProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Local state for immediate input feedback
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    if (localValue === value) return;

    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
  };

  const handleSearch = () => {
    // Immediately update the value when search is triggered
    if (localValue !== value) {
      onChange(localValue);
    }
    onSearch?.();
  };

  return (
    <SearchInput
      value={localValue}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder={t.placeholder}
      disabled={disabled}
      showClearButton
      showSearchButton={false}
      className={className}
      aria-label={t.searchJobs}
    />
  );
}

export default SearchBar;
