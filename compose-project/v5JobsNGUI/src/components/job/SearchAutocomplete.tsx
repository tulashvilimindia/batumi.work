/**
 * SearchAutocomplete Component - V5 Feature
 * Enhanced search with recent searches and suggestions
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Clock, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecentSearchesStore, useRecentSearches } from '@/stores';
import type { Language } from '@/components/ui';

const translations = {
  ge: {
    placeholder: 'ვაკანსიების ძიება...',
    recentSearches: 'ბოლო ძიებები',
    clearRecent: 'გასუფთავება',
    noRecent: 'ბოლო ძიებები არ არის',
  },
  en: {
    placeholder: 'Search jobs, companies...',
    recentSearches: 'Recent Searches',
    clearRecent: 'Clear',
    noRecent: 'No recent searches',
  },
};

export interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
}

export function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  debounceMs = 300,
  disabled = false,
  className,
}: SearchAutocompleteProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const recentSearches = useRecentSearches();
  const { addSearch, removeSearch, clearAll } = useRecentSearchesStore();

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce onChange
  useEffect(() => {
    if (localValue === value) return;

    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hide to allow click on dropdown items
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowDropdown(false);
      }
    }, 200);
  };

  const handleSearch = () => {
    if (localValue.trim()) {
      addSearch(localValue.trim());
      onChange(localValue);
      onSearch?.(localValue);
    }
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectRecent = (query: string) => {
    setLocalValue(query);
    onChange(query);
    onSearch?.(query);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  const showRecentSearches = showDropdown && !localValue && recentSearches.length > 0;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div
        className={cn(
          'relative flex items-center',
          'rounded-lg transition-all duration-200',
          isFocused && 'ring-2 ring-[#D4A574]'
        )}
        style={{
          background: '#FFFAF5',
          border: '2px solid #D4A574',
          boxShadow: isFocused ? '3px 3px 0 #3D2914' : '2px 2px 0 #3D2914',
        }}
      >
        <Search
          size={18}
          className="absolute left-3 pointer-events-none"
          style={{ color: '#8B6B4B' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          disabled={disabled}
          className={cn(
            'w-full py-3 pl-10 pr-10',
            'bg-transparent border-none outline-none',
            'text-sm placeholder:text-[#8B6B4B]'
          )}
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: '#3D2914',
          }}
          aria-label={t.placeholder}
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded hover:bg-[rgba(139,38,53,0.1)] transition-colors"
            aria-label="Clear"
          >
            <X size={16} style={{ color: '#8B2635' }} />
          </button>
        )}
      </div>

      {/* Recent Searches Dropdown */}
      {showRecentSearches && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg z-50 overflow-hidden"
          style={{
            background: '#FFFAF5',
            border: '2px solid #D4A574',
            boxShadow: '4px 4px 0 #3D2914',
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: '1px solid rgba(212, 165, 116, 0.5)' }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: '#6B4423' }}
            >
              {t.recentSearches}
            </span>
            <button
              onClick={clearAll}
              className="text-xs hover:underline"
              style={{ color: '#8B2635' }}
            >
              {t.clearRecent}
            </button>
          </div>
          <div className="py-1">
            {recentSearches.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSelectRecent(query)}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-[rgba(212,165,116,0.1)] transition-colors"
              >
                <Clock size={14} style={{ color: '#8B6B4B' }} />
                <span
                  className="flex-1 text-sm truncate"
                  style={{ color: '#3D2914' }}
                >
                  {query}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearch(query);
                  }}
                  className="p-0.5 rounded hover:bg-[rgba(139,38,53,0.1)]"
                >
                  <X size={12} style={{ color: '#8B6B4B' }} />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;
