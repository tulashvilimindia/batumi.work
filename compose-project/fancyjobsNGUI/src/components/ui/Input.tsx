import React, { forwardRef, useId } from 'react';
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
}

/**
 * Input component with label, error state, icons, and clear functionality
 * Fully accessible with proper ARIA attributes
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
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
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            aria-label={!label ? ariaLabel : undefined}
            className={cn(
              // Base styles
              'w-full h-10 px-3 py-2',
              'text-[var(--color-text-primary)]',
              'bg-[var(--color-surface)]',
              'border border-[var(--color-border)]',
              'rounded',
              'placeholder:text-[var(--color-text-tertiary)]',
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
              // Padding for icons
              leftIcon && 'pl-10',
              (rightIcon || showClearButton) && 'pr-10',
              className
            )}
            {...props}
          />
          {showClearButton && (
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
              aria-label="Clear input"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
          {rightIcon && !showClearButton && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>
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

Input.displayName = 'Input';

export default Input;
