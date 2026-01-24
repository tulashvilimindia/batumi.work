import { type ReactNode } from 'react';
import { cn } from '@/utils/helpers';

// ============================================================
// TYPES
// ============================================================

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// ============================================================
// CONSTANTS
// ============================================================

const PADDING_STYLES = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

// ============================================================
// COMPONENT
// ============================================================

export function Card({
  children,
  title,
  subtitle,
  actions,
  className = '',
  padding = 'md',
}: CardProps) {
  const hasHeader = title || subtitle || actions;

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700', className)}>
      {hasHeader && (
        <div className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={PADDING_STYLES[padding]}>{children}</div>
    </div>
  );
}
