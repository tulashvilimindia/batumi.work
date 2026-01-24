import { type ReactNode } from 'react';
import { InboxIcon } from 'lucide-react';
import { cn } from '@/utils/helpers';

// ============================================================
// TYPES
// ============================================================

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function EmptyState({
  message = 'No data found',
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 text-gray-400 dark:text-gray-500">
        {icon || <InboxIcon className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{message}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
