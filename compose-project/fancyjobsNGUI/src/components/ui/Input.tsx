/**
 * Input Component - Cyberpunk Neon Edition
 * Text input with neon glow effects and animated border
 */

import React, { forwardRef, useId, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Input value */
  value: string;
  /** Change handler - receives the new value string */
  onChange: (value: string) => void;
  /** Label text (renders visually) */
  label?: string;
  /** Error message */
  error?: string;
  /** Icon to show on the left */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right */
  rightIcon?: React.ReactNode;
  /** Show clear button when has value */
  clearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Container className */
  containerClassName?: string;
  /** Neon color variant */
  neonColor?: 'cyan' | 'pink' | 'purple' | 'green';
}

const neonColors = {
  cyan: { color: '#00F5FF', glow: 'rgba(0, 245, 255, 0.5)' },
  pink: { color: '#FF006E', glow: 'rgba(255, 0, 110, 0.5)' },
  purple: { color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.5)' },
  green: { color: '#39FF14', glow: 'rgba(57, 255, 20, 0.5)' },
};

/**
 * Cyberpunk Input component with neon glow effects
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      type = 'text',
      value,
      onChange,
      label,
      error,
      disabled,
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      neonColor = 'cyan',
      id: providedId,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;
    const hasValue = value && value.length > 0;
    const showClearButton = clearable && hasValue && !disabled;
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    const colors = error
      ? { color: '#FF006E', glow: 'rgba(255, 0, 110, 0.5)' }
      : neonColors[neonColor];

    return (
      <div className={cn('flex flex-col gap-2', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold tracking-wider uppercase"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              color: '#A0A0B0',
            }}
          >
            {label}
          </label>
        )}

        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated border wrapper */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              padding: '1px',
              background: isFocused
                ? `linear-gradient(135deg, ${colors.color}, #8B5CF6, ${colors.color})`
                : isHovered
                  ? `linear-gradient(135deg, ${colors.color}60, rgba(139, 92, 246, 0.4), ${colors.color}60)`
                  : 'rgba(255, 255, 255, 0.1)',
              backgroundSize: isFocused ? '200% 200%' : '100% 100%',
              animation: isFocused ? 'border-flow 3s ease infinite' : 'none',
              borderRadius: '12px',
            }}
          >
            <div
              className="w-full h-full rounded-xl"
              style={{ background: 'rgba(10, 10, 20, 0.9)' }}
            />
          </div>

          {/* Glow effect */}
          {(isFocused || isHovered) && (
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                boxShadow: isFocused
                  ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`
                  : `0 0 10px ${colors.glow}`,
                opacity: isFocused ? 0.5 : 0.3,
              }}
            />
          )}

          {leftIcon && (
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors duration-300"
              style={{
                color: isFocused ? colors.color : '#A0A0B0',
                filter: isFocused ? `drop-shadow(0 0 5px ${colors.glow})` : 'none',
              }}
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            aria-label={!label ? ariaLabel : undefined}
            className={cn(
              'relative z-10 w-full h-12 px-4 py-3',
              'bg-transparent rounded-xl',
              'text-sm font-medium',
              'placeholder:text-[#606070]',
              'transition-all duration-300',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-11',
              (rightIcon || showClearButton) && 'pr-11',
              className
            )}
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              color: '#E0E0E8',
            }}
            {...props}
          />

          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#A0A0B0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 110, 0.2)';
                e.currentTarget.style.color = '#FF006E';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 0, 110, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#A0A0B0';
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label="Clear input"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}

          {rightIcon && !showClearButton && (
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors duration-300"
              style={{
                color: isFocused ? colors.color : '#A0A0B0',
                filter: isFocused ? `drop-shadow(0 0 5px ${colors.glow})` : 'none',
              }}
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}

          {/* Corner accents */}
          <div
            className="absolute top-0 left-0 w-3 h-[1px] z-20"
            style={{ background: colors.color, opacity: isFocused ? 1 : 0.3 }}
          />
          <div
            className="absolute top-0 left-0 w-[1px] h-3 z-20"
            style={{ background: colors.color, opacity: isFocused ? 1 : 0.3 }}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-[1px] z-20"
            style={{ background: colors.color, opacity: isFocused ? 1 : 0.3 }}
          />
          <div
            className="absolute bottom-0 right-0 w-[1px] h-3 z-20"
            style={{ background: colors.color, opacity: isFocused ? 1 : 0.3 }}
          />
        </div>

        {error && (
          <div
            id={errorId}
            role="alert"
            className="flex items-center gap-2 text-sm font-medium"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              color: '#FF006E',
              textShadow: '0 0 10px rgba(255, 0, 110, 0.5)',
            }}
          >
            <span className="w-1 h-1 rounded-full bg-[#FF006E]" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
