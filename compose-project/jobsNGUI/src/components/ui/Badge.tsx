import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Badge style variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'vip' | 'new' | 'salary' | 'remote';
  /** Badge size */
  size?: 'sm' | 'md';
  /** Additional className */
  className?: string;
}

const variantStyles = {
  default: [
    'bg-[var(--color-surface-alt)]',
    'text-[var(--color-text-secondary)]',
  ],
  success: [
    'bg-[var(--color-success)]/10',
    'text-[var(--color-success)]',
  ],
  warning: [
    'bg-[var(--color-warning)]/10',
    'text-[var(--color-warning)]',
  ],
  error: [
    'bg-[var(--color-error)]/10',
    'text-[var(--color-error)]',
  ],
  info: [
    'bg-[var(--color-info)]/10',
    'text-[var(--color-info)]',
  ],
  vip: [
    'bg-[var(--color-vip-bg)]',
    'text-black',
    'font-medium',
  ],
  new: [
    'bg-[var(--color-new-badge)]',
    'text-[var(--color-new-badge-text)]',
    'font-medium',
  ],
  salary: [
    'bg-[var(--color-salary)]',
    'text-[var(--color-salary-text)]',
  ],
  remote: [
    'bg-[var(--color-remote)]/10',
    'text-[var(--color-remote)]',
  ],
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
};

/**
 * Badge component for displaying status indicators, tags, and labels
 * Supports multiple variants for different contexts (VIP, NEW, salary, etc.)
 */
export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'rounded',
        'uppercase tracking-wide',
        'whitespace-nowrap',
        // Variant styles
        variantStyles[variant],
        // Size styles
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
