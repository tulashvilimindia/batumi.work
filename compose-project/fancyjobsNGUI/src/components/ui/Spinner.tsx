import React from 'react';
import { cn } from '../../lib/utils';

export interface SpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';
  /** Spinner color */
  color?: 'primary' | 'white' | 'inherit';
  /** Additional className */
  className?: string;
  /** Accessible label */
  label?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

const colorStyles = {
  primary: 'text-[var(--color-primary)]',
  white: 'text-white',
  inherit: 'text-current',
};

const borderSizes = {
  sm: 'border-2',
  md: 'border-[3px]',
  lg: 'border-4',
};

/**
 * Animated loading spinner component
 * Accessible with role="status" and screen reader text
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  className,
  label = 'Loading...',
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center justify-center', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full',
          'border-[var(--color-border)]',
          'border-t-current',
          sizeStyles[size],
          colorStyles[color],
          borderSizes[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Spinner;
