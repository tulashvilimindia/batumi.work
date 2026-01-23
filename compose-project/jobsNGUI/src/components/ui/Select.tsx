import React, {
  forwardRef,
  useId,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Array of options to display */
  options: SelectOption[];
  /** Currently selected value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
  /** Container className */
  containerClassName?: string;
  /** Input id */
  id?: string;
  /** Aria label */
  'aria-label'?: string;
}

/**
 * Custom Select component with dropdown, keyboard navigation, and accessibility
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select...',
      label,
      error,
      disabled,
      className,
      containerClassName,
      id: providedId,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = providedId || generatedId;
    const listboxId = `${selectId}-listbox`;
    const errorId = `${selectId}-error`;

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);
    const enabledOptions = options.filter((opt) => !opt.disabled);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset active index when dropdown opens
    useEffect(() => {
      if (isOpen) {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
      }
    }, [isOpen, options, value]);

    // Scroll active option into view
    useEffect(() => {
      if (isOpen && listboxRef.current && activeIndex >= 0) {
        const activeElement = listboxRef.current.children[
          activeIndex
        ] as HTMLElement;
        activeElement?.scrollIntoView({ block: 'nearest' });
      }
    }, [isOpen, activeIndex]);

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleSelect = useCallback(
      (optionValue: string) => {
        const option = options.find((opt) => opt.value === optionValue);
        if (option && !option.disabled) {
          onChange(optionValue);
          setIsOpen(false);
        }
      },
      [onChange, options]
    );

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen && activeIndex >= 0) {
            handleSelect(options[activeIndex].value);
          } else {
            setIsOpen(true);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setActiveIndex((prev) => {
              let next = prev + 1;
              while (next < options.length && options[next].disabled) {
                next++;
              }
              return next < options.length ? next : prev;
            });
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setActiveIndex((prev) => {
              let next = prev - 1;
              while (next >= 0 && options[next].disabled) {
                next--;
              }
              return next >= 0 ? next : prev;
            });
          }
          break;
        case 'Home':
          event.preventDefault();
          if (isOpen) {
            const firstEnabled = options.findIndex((opt) => !opt.disabled);
            setActiveIndex(firstEnabled);
          }
          break;
        case 'End':
          event.preventDefault();
          if (isOpen) {
            let lastEnabled = options.length - 1;
            while (lastEnabled >= 0 && options[lastEnabled].disabled) {
              lastEnabled--;
            }
            setActiveIndex(lastEnabled);
          }
          break;
        default:
          // Type-ahead: find option starting with typed character
          if (isOpen && event.key.length === 1) {
            const char = event.key.toLowerCase();
            const startIndex = activeIndex + 1;
            const searchOptions = [
              ...options.slice(startIndex),
              ...options.slice(0, startIndex),
            ];
            const found = searchOptions.find(
              (opt) => !opt.disabled && opt.label.toLowerCase().startsWith(char)
            );
            if (found) {
              setActiveIndex(options.indexOf(found));
            }
          }
      }
    };

    return (
      <div
        ref={containerRef}
        className={cn('flex flex-col gap-1.5 relative', containerClassName)}
      >
        {label && (
          <label
            id={`${selectId}-label`}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <button
          ref={ref}
          type="button"
          id={selectId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-label={!label ? ariaLabel : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-activedescendant={
            isOpen && activeIndex >= 0
              ? `${selectId}-option-${activeIndex}`
              : undefined
          }
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            // Base styles
            'w-full h-10 px-3 py-2',
            'flex items-center justify-between gap-2',
            'text-left',
            'bg-[var(--color-surface)]',
            'border border-[var(--color-border)]',
            'rounded',
            'transition-colors duration-200',
            // Focus state
            'focus:outline-none focus:border-[var(--color-primary)]',
            'focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20',
            // Error state
            error && [
              'border-[var(--color-error)]',
              'focus:border-[var(--color-error)]',
              'focus:ring-[var(--color-error)]',
            ],
            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'disabled:bg-[var(--color-surface-alt)]',
            className
          )}
        >
          <span
            className={cn(
              'truncate',
              selectedOption
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)]'
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={18}
            className={cn(
              'shrink-0 text-[var(--color-text-tertiary)]',
              'transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? `${selectId}-label` : undefined}
            className={cn(
              'absolute z-50',
              'top-full left-0 right-0',
              'mt-1',
              'max-h-60 overflow-auto',
              'bg-[var(--color-surface)]',
              'border border-[var(--color-border)]',
              'rounded shadow-lg'
            )}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${selectId}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                className={cn(
                  'px-3 py-2',
                  'flex items-center justify-between gap-2',
                  'cursor-pointer',
                  'transition-colors',
                  // Active/hover state
                  index === activeIndex &&
                    !option.disabled &&
                    'bg-[var(--color-surface-hover)]',
                  // Selected state
                  option.value === value && 'text-[var(--color-primary)]',
                  // Disabled state
                  option.disabled && [
                    'opacity-50',
                    'cursor-not-allowed',
                    'bg-transparent',
                  ]
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && (
                  <Check
                    size={16}
                    className="shrink-0 text-[var(--color-primary)]"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-3 py-2 text-[var(--color-text-tertiary)]">
                No options available
              </li>
            )}
          </ul>
        )}

        {error && (
          <span
            id={errorId}
            role="alert"
            className="text-sm text-[var(--color-error)]"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
