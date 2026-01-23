import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  /** Icon to display (defaults to Search icon) */
  icon?: React.ReactNode;
  /** Main title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional primary action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional className */
  className?: string;
}

/**
 * Empty state component for displaying when no content is available
 * Used for empty search results, empty lists, etc.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'text-center',
        'py-12 px-4',
        className
      )}
      role="status"
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center',
          'w-16 h-16 mb-4',
          'rounded-full',
          'bg-[var(--color-surface-alt)]',
          'text-[var(--color-text-tertiary)]'
        )}
        aria-hidden="true"
      >
        {icon || <Search size={32} />}
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-lg font-medium',
          'text-[var(--color-text-primary)]',
          'mb-2'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'text-sm',
            'text-[var(--color-text-secondary)]',
            'max-w-md mb-6'
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
