import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps {
  /** Skeleton shape variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width (number for pixels, string for any CSS value) */
  width?: string | number;
  /** Height (number for pixels, string for any CSS value) */
  height?: string | number;
  /** Number of text lines (only for text variant) */
  lines?: number;
  /** Additional className */
  className?: string;
}

/**
 * Skeleton component for loading placeholders
 * Displays animated shimmer effect
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
}: SkeletonProps) {
  const getStyles = () => {
    const styles: React.CSSProperties = {};

    if (width !== undefined) {
      styles.width = typeof width === 'number' ? `${width}px` : width;
    }

    if (height !== undefined) {
      styles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return styles;
  };

  const baseClasses = cn(
    'animate-pulse',
    'bg-gradient-to-r',
    'from-[var(--color-surface-hover)]',
    'via-[var(--color-surface-alt)]',
    'to-[var(--color-surface-hover)]',
    'bg-[length:200%_100%]'
  );

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('flex flex-col gap-2', className)} role="status" aria-label="Loading">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              'h-4 rounded'
            )}
            style={{
              ...getStyles(),
              // Last line is usually shorter
              width: index === lines - 1 ? '75%' : (width || '100%'),
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        // Default widths if not specified
        !width && variant === 'text' && 'w-full',
        !width && variant === 'circular' && 'w-10',
        !width && variant === 'rectangular' && 'w-full',
        // Default heights if not specified
        !height && variant === 'rectangular' && 'h-20',
        className
      )}
      style={getStyles()}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Pre-built skeleton for job card loading state
 */
export function JobCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-4 border border-[var(--color-border)] rounded-lg',
        'bg-[var(--color-surface)]',
        className
      )}
      role="status"
      aria-label="Loading job"
    >
      {/* Badges */}
      <div className="flex gap-2 mb-3">
        <Skeleton variant="rectangular" width={50} height={20} />
        <Skeleton variant="rectangular" width={40} height={20} />
      </div>
      {/* Title */}
      <Skeleton variant="text" width="80%" className="mb-2 h-5" />
      {/* Company */}
      <Skeleton variant="text" width="50%" className="mb-3 h-4" />
      {/* Metadata */}
      <div className="flex gap-4">
        <Skeleton variant="text" width={80} className="h-3" />
        <Skeleton variant="text" width={100} className="h-3" />
        <Skeleton variant="text" width={70} className="h-3" />
      </div>
      <span className="sr-only">Loading job...</span>
    </div>
  );
}

export default Skeleton;
