/**
 * SearchInput Component - Adjarian Folk Edition
 * Traditional styled search input with warm tones
 */

import React, { forwardRef, useEffect, useRef, useCallback, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  debounceMs?: number;
  showClearButton?: boolean;
  showSearchButton?: boolean;
  containerClassName?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (delay <= 0) {
        callback(...args);
      } else {
        timeoutRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      }
    }) as T,
    [callback, delay]
  );
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      value,
      onChange,
      onSearch,
      debounceMs = 0,
      showClearButton = true,
      showSearchButton = false,
      placeholder = 'Search...',
      disabled,
      'aria-label': ariaLabel = 'Search',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;

    const debouncedOnChange = useDebouncedCallback(
      (newValue: string) => onChange(newValue),
      debounceMs
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (debounceMs > 0) {
        debouncedOnChange(e.target.value);
      } else {
        onChange(e.target.value);
      }
    };

    const handleClear = () => {
      onChange('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        e.preventDefault();
        onSearch();
      }
    };

    const handleSearchClick = () => {
      onSearch?.();
    };

    return (
      <div
        className={cn(
          'flex items-center gap-3',
          showSearchButton ? 'flex-1' : 'relative',
          containerClassName
        )}
      >
        <div className="relative flex-1">
          {/* Search icon */}
          <span
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 z-10',
              'pointer-events-none transition-colors duration-200'
            )}
            style={{
              color: isFocused ? '#8B2635' : '#8B6B4B',
            }}
            aria-hidden="true"
          >
            <Search size={18} />
          </span>

          {/* Input */}
          <input
            ref={ref}
            type="search"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn(
              'relative w-full h-12 pl-12 pr-12 py-3',
              'rounded-lg',
              'transition-all duration-200',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              '[&::-webkit-search-cancel-button]:hidden',
              '[&::-webkit-search-decoration]:hidden',
              className
            )}
            style={{
              background: '#FFFAF5',
              border: `2px solid ${isFocused ? '#D4A574' : '#C4A484'}`,
              boxShadow: isFocused
                ? '3px 3px 0 #3D2914, inset 0 0 15px rgba(212, 165, 116, 0.1)'
                : 'none',
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#3D2914',
            }}
            {...props}
          />

          {/* Clear button */}
          {showClearButton && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 z-10',
                'p-1 rounded-md',
                'transition-all duration-200'
              )}
              style={{
                color: '#8B6B4B',
                background: 'rgba(139, 38, 53, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#8B2635';
                e.currentTarget.style.background = 'rgba(139, 38, 53, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8B6B4B';
                e.currentTarget.style.background = 'rgba(139, 38, 53, 0.1)';
              }}
              aria-label="Clear search"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Search button (optional) */}
        {showSearchButton && (
          <button
            type="button"
            onClick={handleSearchClick}
            disabled={disabled}
            className={cn(
              'flex items-center justify-center',
              'h-12 px-6',
              'font-semibold tracking-wide',
              'rounded-lg',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{
              background: 'linear-gradient(135deg, #8B2635, #A83C4B)',
              border: '2px solid #D4A574',
              boxShadow: '3px 3px 0 #3D2914',
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#F5E6D3',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-1px, -1px)';
              e.currentTarget.style.boxShadow = '4px 4px 0 #3D2914';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '3px 3px 0 #3D2914';
            }}
            aria-label="Search"
          >
            <Search size={18} aria-hidden="true" />
            <span className="ml-2 hidden sm:inline">Search</span>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
