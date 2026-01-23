import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  /** Error object (optional) */
  error?: Error | null;
  /** Custom title (overrides default) */
  title?: string;
  /** Custom description (overrides default) */
  description?: string;
  /** Retry callback */
  retry?: () => void;
  /** Whether this is a network/offline error */
  isOffline?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Error state component for displaying error messages with retry option
 */
export function ErrorState({
  error,
  title,
  description,
  retry,
  isOffline = false,
  className,
}: ErrorStateProps) {
  const Icon = isOffline ? WifiOff : AlertTriangle;

  const defaultTitle = isOffline ? "You're offline" : 'Something went wrong';
  const defaultDescription = isOffline
    ? 'Check your internet connection and try again.'
    : "We couldn't load the content. Please try again.";

  const displayTitle = title || defaultTitle;
  const displayDescription = description || (error?.message ?? defaultDescription);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'text-center',
        'py-12 px-4',
        className
      )}
      role="alert"
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center',
          'w-16 h-16 mb-4',
          'rounded-full',
          'bg-[var(--color-error)]/10',
          'text-[var(--color-error)]'
        )}
        aria-hidden="true"
      >
        <Icon size={32} />
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-lg font-medium',
          'text-[var(--color-text-primary)]',
          'mb-2'
        )}
      >
        {displayTitle}
      </h3>

      {/* Description */}
      <p
        className={cn(
          'text-sm',
          'text-[var(--color-text-secondary)]',
          'max-w-md mb-6'
        )}
      >
        {displayDescription}
      </p>

      {/* Retry button */}
      {retry && (
        <Button
          variant="primary"
          onClick={retry}
          leftIcon={<RefreshCw size={18} />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
