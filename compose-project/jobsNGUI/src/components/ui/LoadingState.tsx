import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';
import { Skeleton, JobCardSkeleton } from './Skeleton';

export interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /** Display as full screen overlay */
  fullScreen?: boolean;
  /** Type of loading indicator */
  variant?: 'spinner' | 'skeleton' | 'jobCards';
  /** Number of skeleton items (for skeleton/jobCards variant) */
  count?: number;
  /** Additional className */
  className?: string;
}

/**
 * Loading state component with different display options
 * Supports spinner, skeleton, and job card skeleton variants
 */
export function LoadingState({
  message,
  fullScreen = false,
  variant = 'spinner',
  count = 6,
  className,
}: LoadingStateProps) {
  // Full screen spinner
  if (fullScreen) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50',
          'flex flex-col items-center justify-center',
          'bg-[var(--color-background)]/80 backdrop-blur-sm',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Spinner size="lg" />
        {message && (
          <p className="mt-4 text-[var(--color-text-secondary)]">{message}</p>
        )}
      </div>
    );
  }

  // Spinner variant
  if (variant === 'spinner') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'py-12',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Spinner size="lg" />
        {message && (
          <p className="mt-4 text-[var(--color-text-secondary)]">{message}</p>
        )}
      </div>
    );
  }

  // Job cards skeleton variant
  if (variant === 'jobCards') {
    return (
      <div
        className={cn('grid gap-4', className)}
        role="status"
        aria-label="Loading jobs"
      >
        {Array.from({ length: count }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
        <span className="sr-only">{message || 'Loading jobs...'}</span>
      </div>
    );
  }

  // Generic skeleton variant
  return (
    <div
      className={cn('space-y-4', className)}
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </div>
      ))}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );
}

export default LoadingState;
