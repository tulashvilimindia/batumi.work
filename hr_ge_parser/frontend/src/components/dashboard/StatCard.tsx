import { type ReactNode } from 'react';
import { cn } from '@/utils/helpers';
import { formatCompactNumber } from '@/utils/formatters';

// ============================================================
// TYPES
// ============================================================

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  change?: number;
  changeLabel?: string;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function StatCard({
  title,
  value,
  icon,
  change,
  changeLabel,
  className = '',
}: StatCardProps) {
  const isPositiveChange = change !== undefined && change >= 0;

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-5 dark:bg-gray-800 dark:border-gray-700', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCompactNumber(value)}
          </p>
          {change !== undefined && (
            <p className={cn(
              'mt-2 text-sm font-medium',
              isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {isPositiveChange ? '+' : ''}{change}
              {changeLabel && <span className="text-gray-500 dark:text-gray-400"> {changeLabel}</span>}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
