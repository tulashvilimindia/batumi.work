/**
 * Skeleton Component - Adjarian Folk Edition
 * Loading placeholders with warm shimmer effect
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
  color?: 'gold' | 'red' | 'green' | 'default';
  className?: string;
}

const colorConfig = {
  gold: {
    from: 'rgba(212, 165, 116, 0.1)',
    via: 'rgba(212, 165, 116, 0.25)',
    to: 'rgba(212, 165, 116, 0.1)',
    border: 'rgba(212, 165, 116, 0.2)',
  },
  red: {
    from: 'rgba(139, 38, 53, 0.08)',
    via: 'rgba(139, 38, 53, 0.15)',
    to: 'rgba(139, 38, 53, 0.08)',
    border: 'rgba(139, 38, 53, 0.15)',
  },
  green: {
    from: 'rgba(45, 90, 61, 0.08)',
    via: 'rgba(45, 90, 61, 0.15)',
    to: 'rgba(45, 90, 61, 0.08)',
    border: 'rgba(45, 90, 61, 0.15)',
  },
  default: {
    from: 'rgba(196, 164, 132, 0.15)',
    via: 'rgba(212, 165, 116, 0.3)',
    to: 'rgba(196, 164, 132, 0.15)',
    border: 'rgba(196, 164, 132, 0.2)',
  },
};

export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  color = 'default',
  className,
}: SkeletonProps) {
  const config = colorConfig[color];

  const getStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      background: `linear-gradient(90deg, ${config.from}, ${config.via}, ${config.from})`,
      backgroundSize: '200% 100%',
      animation: 'folk-shimmer 2s ease-in-out infinite',
      border: `1px solid ${config.border}`,
    };

    if (width !== undefined) {
      styles.width = typeof width === 'number' ? `${width}px` : width;
    }

    if (height !== undefined) {
      styles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return styles;
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div
        className={cn('flex flex-col gap-2', className)}
        role="status"
        aria-label="Loading"
      >
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-4 rounded-md"
            style={{
              ...getStyles(),
              width: index === lines - 1 ? '75%' : (width || '100%'),
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        !width && variant === 'text' && 'w-full',
        !width && variant === 'circular' && 'w-10',
        !width && variant === 'rectangular' && 'w-full',
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

export function JobCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-5 rounded-lg',
        'relative overflow-hidden',
        className
      )}
      style={{
        background: '#FFFAF5',
        border: '2px solid #C4A484',
      }}
      role="status"
      aria-label="Loading job"
    >
      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <Skeleton variant="rectangular" width={50} height={20} color="red" />
        <Skeleton variant="rectangular" width={40} height={20} color="gold" />
      </div>

      {/* Title */}
      <Skeleton variant="text" width="85%" className="mb-3 h-5" color="gold" />

      {/* Company */}
      <Skeleton variant="text" width="50%" className="mb-4 h-4" color="green" />

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

export function JobListSkeleton({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default Skeleton;
