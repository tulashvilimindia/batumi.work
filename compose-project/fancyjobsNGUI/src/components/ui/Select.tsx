/**
 * Select Component - Cyberpunk Neon Edition
 * Glowing dropdown with animated border and neon effects
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
 * Custom Select component with cyberpunk neon styling
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
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

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
            className="text-sm font-medium text-neon-cyan tracking-wider uppercase"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
            }}
          >
            {label}
          </label>
        )}

        {/* Select Button with Neon Border */}
        <div className="relative">
          {/* Animated neon border */}
          <div
            className="absolute -inset-[1px] rounded-lg transition-all duration-300 pointer-events-none"
            style={{
              background: isOpen
                ? 'linear-gradient(135deg, #00F5FF, #FF006E, #8B5CF6, #00F5FF)'
                : isHovered && !disabled
                ? 'linear-gradient(135deg, rgba(0, 245, 255, 0.5), rgba(139, 92, 246, 0.5))'
                : 'linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(139, 92, 246, 0.2))',
              backgroundSize: '300% 300%',
              animation: isOpen ? 'border-flow 3s ease infinite' : 'none',
              boxShadow: isOpen
                ? '0 0 20px rgba(0, 245, 255, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)'
                : isHovered && !disabled
                ? '0 0 15px rgba(0, 245, 255, 0.3)'
                : '0 0 10px rgba(0, 245, 255, 0.1)',
            }}
          />

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
              'transition-all duration-300',
              'focus:outline-none',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              className
            )}
            style={{
              background: 'rgba(10, 10, 20, 0.8)',
              backdropFilter: 'blur(10px)',
              fontFamily: 'Rajdhani, sans-serif',
            }}
          >
            <span
              className={cn(
                'truncate text-sm tracking-wider',
                selectedOption ? 'text-text-primary' : 'text-text-tertiary'
              )}
              style={{
                textShadow: selectedOption && isHovered ? '0 0 10px currentColor' : 'none',
              }}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              size={18}
              className={cn(
                'shrink-0 transition-all duration-300',
                isOpen ? 'rotate-180 text-neon-pink' : 'text-neon-cyan'
              )}
              style={{
                filter: isOpen ? 'drop-shadow(0 0 5px #FF006E)' : 'drop-shadow(0 0 5px #00F5FF)',
              }}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Dropdown List */}
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
              'scrollbar-thin scrollbar-thumb-neon-purple scrollbar-track-transparent'
            )}
            style={{
              background: 'rgba(10, 10, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 245, 255, 0.1), inset 0 0 30px rgba(0, 245, 255, 0.02)',
            }}
          >
            {options.map((option, index) => (
              <SelectOption
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
                className="px-4 py-3 text-text-tertiary text-sm"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
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
            className="text-sm text-neon-pink"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              textShadow: '0 0 10px rgba(255, 0, 110, 0.5)',
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

// Separate component for options to manage hover state
interface SelectOptionProps {
  option: SelectOption;
  index: number;
  selectId: string;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (value: string) => void;
  onHover: () => void;
}

function SelectOption({
  option,
  index,
  selectId,
  isActive,
  isSelected,
  onSelect,
  onHover,
}: SelectOptionProps) {
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
        'transition-all duration-200',
        'text-sm tracking-wider',
        option.disabled && 'opacity-40 cursor-not-allowed'
      )}
      style={{
        fontFamily: 'Rajdhani, sans-serif',
        background: isActive && !option.disabled
          ? 'linear-gradient(90deg, rgba(0, 245, 255, 0.15), transparent)'
          : 'transparent',
        borderLeft: isActive && !option.disabled
          ? '2px solid #00F5FF'
          : '2px solid transparent',
        color: isSelected
          ? '#00F5FF'
          : isActive && !option.disabled
          ? '#ffffff'
          : '#A0A0B0',
        textShadow: isSelected || (isActive && !option.disabled)
          ? '0 0 10px currentColor'
          : 'none',
      }}
    >
      <span className="truncate">{option.label}</span>
      {isSelected && (
        <Check
          size={16}
          className="shrink-0 text-neon-cyan"
          style={{ filter: 'drop-shadow(0 0 5px #00F5FF)' }}
          aria-hidden="true"
        />
      )}
    </li>
  );
}

export default Select;
