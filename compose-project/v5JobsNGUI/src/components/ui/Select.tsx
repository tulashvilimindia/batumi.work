/**
 * Select Component - Adjarian Folk Edition
 * Traditional styled dropdown with warm wood tones
 */

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
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  id?: string;
  'aria-label'?: string;
}

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
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

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

    useEffect(() => {
      if (isOpen) {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
      }
    }, [isOpen, options, value]);

    useEffect(() => {
      if (isOpen && listboxRef.current && activeIndex >= 0) {
        const activeElement = listboxRef.current.children[activeIndex] as HTMLElement;
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
            className="text-sm font-semibold tracking-wide"
            style={{
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#6B4423',
            }}
          >
            {label}
          </label>
        )}

        <div className="relative">
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              'relative w-full h-10 px-4 py-2',
              'flex items-center justify-between gap-2',
              'text-left',
              'rounded-lg',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#D4A574]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            style={{
              background: '#FFFAF5',
              border: `2px solid ${isOpen ? '#D4A574' : isHovered && !disabled ? '#8B6B4B' : '#C4A484'}`,
              boxShadow: isOpen
                ? '2px 2px 0 #3D2914, inset 0 0 10px rgba(212, 165, 116, 0.1)'
                : isHovered && !disabled
                ? '2px 2px 0 #3D2914'
                : 'none',
              fontFamily: 'Source Sans Pro, sans-serif',
            }}
          >
            <span
              className={cn(
                'truncate text-sm',
                selectedOption ? 'text-[#3D2914]' : 'text-[#8B6B4B]'
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              size={18}
              className={cn(
                'shrink-0 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              style={{ color: '#6B4423' }}
              aria-hidden="true"
            />
          </button>
        </div>

        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? `${selectId}-label` : undefined}
            className={cn(
              'absolute z-50',
              'top-full left-0 right-0',
              'mt-2',
              'max-h-60 overflow-auto',
              'rounded-lg',
              'scrollbar-thin scrollbar-thumb-[#C4A484] scrollbar-track-transparent'
            )}
            style={{
              background: '#FFFAF5',
              border: '2px solid #D4A574',
              boxShadow: '4px 4px 0 #3D2914, 0 10px 30px rgba(61, 41, 20, 0.2)',
            }}
          >
            {options.map((option, index) => (
              <FolkSelectOption
                key={option.value}
                option={option}
                index={index}
                selectId={selectId}
                isActive={index === activeIndex}
                isSelected={option.value === value}
                onSelect={handleSelect}
                onHover={() => !option.disabled && setActiveIndex(index)}
              />
            ))}
            {options.length === 0 && (
              <li
                className="px-4 py-3 text-sm"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: '#8B6B4B',
                }}
              >
                No options available
              </li>
            )}
          </ul>
        )}

        {error && (
          <span
            id={errorId}
            role="alert"
            className="text-sm"
            style={{
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#8B2635',
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface FolkSelectOptionProps {
  option: SelectOption;
  index: number;
  selectId: string;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (value: string) => void;
  onHover: () => void;
}

function FolkSelectOption({
  option,
  index,
  selectId,
  isActive,
  isSelected,
  onSelect,
  onHover,
}: FolkSelectOptionProps) {
  return (
    <li
      id={`${selectId}-option-${index}`}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      onClick={() => onSelect(option.value)}
      onMouseEnter={onHover}
      className={cn(
        'px-4 py-2.5',
        'flex items-center justify-between gap-2',
        'cursor-pointer',
        'transition-all duration-150',
        'text-sm',
        option.disabled && 'opacity-40 cursor-not-allowed'
      )}
      style={{
        fontFamily: 'Source Sans Pro, sans-serif',
        background: isActive && !option.disabled
          ? 'linear-gradient(90deg, rgba(212, 165, 116, 0.2), transparent)'
          : 'transparent',
        borderLeft: isSelected
          ? '3px solid #8B2635'
          : isActive && !option.disabled
          ? '3px solid #D4A574'
          : '3px solid transparent',
        color: isSelected
          ? '#8B2635'
          : isActive && !option.disabled
          ? '#3D2914'
          : '#6B4423',
        fontWeight: isSelected ? 600 : 400,
      }}
    >
      <span className="truncate">{option.label}</span>
      {isSelected && (
        <Check
          size={16}
          className="shrink-0"
          style={{ color: '#8B2635' }}
          aria-hidden="true"
        />
      )}
    </li>
  );
}

export default Select;
