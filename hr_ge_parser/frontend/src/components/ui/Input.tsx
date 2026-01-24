import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

// ============================================================
// TYPES
// ============================================================

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================
// CONSTANTS
// ============================================================

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
} as const;

// ============================================================
// COMPONENT
// ============================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, size = 'md', className = '', ...props }, ref) => {
    const baseStyles = 'w-full rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500';
    const borderStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-600';

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(baseStyles, borderStyles, SIZE_STYLES[size], className)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
