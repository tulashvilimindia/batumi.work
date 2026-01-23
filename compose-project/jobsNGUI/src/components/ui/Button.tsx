import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Show loading spinner */
  loading?: boolean;
  /** Make button full width */
  fullWidth?: boolean;
  /** Icon to show on the left */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right */
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: [
    'bg-[var(--color-primary)]',
    'text-white',
    'hover:bg-[var(--color-primary-hover)]',
    'focus-visible:ring-[var(--color-primary)]',
  ],
  secondary: [
    'bg-[var(--color-surface)]',
    'text-[var(--color-text-primary)]',
    'border',
    'border-[var(--color-border)]',
    'hover:bg-[var(--color-surface-hover)]',
    'focus-visible:ring-[var(--color-primary)]',
  ],
  ghost: [
    'bg-transparent',
    'text-[var(--color-text-primary)]',
    'hover:bg-[var(--color-surface-hover)]',
    'focus-visible:ring-[var(--color-primary)]',
  ],
  outline: [
    'bg-transparent',
    'text-[var(--color-primary)]',
    'border',
    'border-[var(--color-primary)]',
    'hover:bg-[var(--color-primary-light)]',
    'focus-visible:ring-[var(--color-primary)]',
  ],
  danger: [
    'bg-[var(--color-error)]',
    'text-white',
    'hover:opacity-90',
    'focus-visible:ring-[var(--color-error)]',
  ],
};

const sizeStyles = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-lg gap-2.5',
};

/**
 * Button component with multiple variants and sizes
 * Supports loading state, icons, and full accessibility
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium rounded',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // Active state
          'active:scale-[0.98]',
          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          className
        )}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size={size} />
            <span className="sr-only">Loading...</span>
            {children && <span aria-hidden="true">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/** Internal loading spinner for Button component */
function LoadingSpinner({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Button;
