/**
 * SearchInput Component - Cyberpunk Neon Edition
 * Glowing search input with animated border effects
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
          'flex items-center gap-2',
          showSearchButton ? 'flex-1' : 'relative',
          containerClassName
        )}
      >
        <div
          className="relative flex-1"
          style={{
            borderRadius: '12px',
          }}
        >
          {/* Animated neon border */}
          <div
            className="absolute -inset-[1px] rounded-xl transition-all duration-300 pointer-events-none"
            style={{
              background: isFocused
                ? 'linear-gradient(135deg, #00F5FF, #FF006E, #8B5CF6, #00F5FF)'
                : 'linear-gradient(135deg, rgba(0, 245, 255, 0.3), rgba(255, 0, 110, 0.2))',
              backgroundSize: '300% 300%',
              animation: isFocused ? 'border-flow 3s ease infinite' : 'none',
              boxShadow: isFocused
                ? '0 0 20px rgba(0, 245, 255, 0.4), 0 0 40px rgba(255, 0, 110, 0.2)'
                : '0 0 10px rgba(0, 245, 255, 0.1)',
            }}
          />

          {/* Search icon */}
          <span
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 z-10',
              'pointer-events-none transition-all duration-300',
              isFocused ? 'text-neon-cyan' : 'text-text-tertiary'
            )}
            style={{
              textShadow: isFocused ? '0 0 10px rgba(0, 245, 255, 0.8)' : 'none',
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
              'text-text-primary',
              'rounded-xl',
              'placeholder:text-text-tertiary',
              'transition-all duration-300',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              '[&::-webkit-search-cancel-button]:hidden',
              '[&::-webkit-search-decoration]:hidden',
              className
            )}
            style={{
              background: 'rgba(10, 10, 20, 0.8)',
              backdropFilter: 'blur(20px)',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
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
                'p-1 rounded-lg',
                'text-text-tertiary',
                'hover:text-neon-pink',
                'transition-all duration-300'
              )}
              style={{
                background: 'rgba(255, 0, 110, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 110, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
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
              'text-white font-semibold tracking-wider uppercase',
              'rounded-xl',
              'transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{
              background: 'linear-gradient(135deg, #00F5FF, #FF006E)',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.4)',
              fontFamily: 'Rajdhani, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 245, 255, 0.6), 0 0 50px rgba(255, 0, 110, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 245, 255, 0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
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
