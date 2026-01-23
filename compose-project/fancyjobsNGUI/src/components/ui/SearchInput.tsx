import React, { forwardRef, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  /** Current search value */
  value: string;
  /** Change handler - receives the new value string */
  onChange: (value: string) => void;
  /** Callback when search is submitted (Enter key or button click) */
  onSearch?: () => void;
  /** Debounce delay in milliseconds (0 to disable) */
  debounceMs?: number;
  /** Show clear button when has value */
  showClearButton?: boolean;
  /** Show search button */
  showSearchButton?: boolean;
  /** Container className */
  containerClassName?: string;
}

/**
 * Debounce hook for delayed value updates
 */
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

/**
 * Search input component with icon, clear button, and optional debouncing
 * Designed for job search functionality
 */
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
    const hasValue = value && value.length > 0;

    // Create debounced onChange handler
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
        <div className="relative flex-1">
          {/* Search icon */}
          <span
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2',
              'text-[var(--color-text-tertiary)]',
              'pointer-events-none'
            )}
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
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn(
              // Base styles
              'w-full h-10 pl-10 pr-10 py-2',
              'text-[var(--color-text-primary)]',
              'bg-[var(--color-surface)]',
              'border border-[var(--color-border)]',
              'rounded',
              'placeholder:text-[var(--color-text-tertiary)]',
              'transition-colors duration-200',
              // Focus state
              'focus:outline-none focus:border-[var(--color-primary)]',
              'focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20',
              // Disabled state
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'disabled:bg-[var(--color-surface-alt)]',
              // Hide browser's default clear button
              '[&::-webkit-search-cancel-button]:hidden',
              '[&::-webkit-search-decoration]:hidden',
              className
            )}
            {...props}
          />

          {/* Clear button */}
          {showClearButton && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'p-0.5 rounded',
                'text-[var(--color-text-tertiary)]',
                'hover:text-[var(--color-text-primary)]',
                'hover:bg-[var(--color-surface-hover)]',
                'focus:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--color-primary)]',
                'transition-colors'
              )}
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
              'h-10 px-4',
              'bg-[var(--color-primary)]',
              'text-white font-medium',
              'rounded',
              'transition-colors duration-200',
              'hover:bg-[var(--color-primary-hover)]',
              'focus:outline-none focus-visible:ring-2',
              'focus-visible:ring-[var(--color-primary)]',
              'focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
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
