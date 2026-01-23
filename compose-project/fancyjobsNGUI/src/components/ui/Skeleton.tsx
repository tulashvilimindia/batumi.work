/**
 * Skeleton Component - Cyberpunk Neon Edition
 * Loading placeholders with neon shimmer effect
 */

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
  /** Neon color theme */
  color?: 'cyan' | 'pink' | 'purple' | 'default';
  /** Additional className */
  className?: string;
}

const colorConfig = {
  cyan: {
    from: 'rgba(0, 245, 255, 0.05)',
    via: 'rgba(0, 245, 255, 0.15)',
    to: 'rgba(0, 245, 255, 0.05)',
    border: 'rgba(0, 245, 255, 0.1)',
  },
  pink: {
    from: 'rgba(255, 0, 110, 0.05)',
    via: 'rgba(255, 0, 110, 0.15)',
    to: 'rgba(255, 0, 110, 0.05)',
    border: 'rgba(255, 0, 110, 0.1)',
  },
  purple: {
    from: 'rgba(139, 92, 246, 0.05)',
    via: 'rgba(139, 92, 246, 0.15)',
    to: 'rgba(139, 92, 246, 0.05)',
    border: 'rgba(139, 92, 246, 0.1)',
  },
  default: {
    from: 'rgba(255, 255, 255, 0.02)',
    via: 'rgba(0, 245, 255, 0.08)',
    to: 'rgba(255, 255, 255, 0.02)',
    border: 'rgba(255, 255, 255, 0.05)',
  },
};

/**
 * Cyberpunk Skeleton with neon shimmer effect
 */
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
      animation: 'shimmer 2s ease-in-out infinite',
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
            className="h-4 rounded"
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
    text: 'h-4 rounded',
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

/**
 * Pre-built skeleton for job card loading state - Cyberpunk Edition
 */
export function JobCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-5 rounded-xl',
        'relative overflow-hidden',
        className
      )}
      style={{
        background: 'rgba(10, 10, 20, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 245, 255, 0.1)',
      }}
      role="status"
      aria-label="Loading job"
    >
      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-8 h-[1px]"
        style={{ background: 'rgba(0, 245, 255, 0.3)' }}
      />
      <div
        className="absolute top-0 left-0 w-[1px] h-6"
        style={{ background: 'rgba(0, 245, 255, 0.3)' }}
      />

      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <Skeleton variant="rectangular" width={50} height={20} color="pink" />
        <Skeleton variant="rectangular" width={40} height={20} color="cyan" />
      </div>

      {/* Title */}
      <Skeleton variant="text" width="85%" className="mb-3 h-5" color="cyan" />

      {/* Company */}
      <Skeleton variant="text" width="50%" className="mb-4 h-4" color="purple" />

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

/**
 * Multiple job card skeletons for loading state
 */
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
