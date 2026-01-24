import { cn } from '@/utils/helpers';

// ============================================================
// TYPES
// ============================================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

// ============================================================
// COMPONENT
// ============================================================

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
    />
  );
}

// ============================================================
// SKELETON VARIANTS
// ============================================================

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={cn('p-4 bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700', className)}>
      <Skeleton height={20} width="60%" className="mb-3" />
      <Skeleton height={16} width="100%" className="mb-2" />
      <Skeleton height={16} width="80%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <Skeleton height={16} width="20%" />
        <Skeleton height={16} width="30%" />
        <Skeleton height={16} width="25%" />
        <Skeleton height={16} width="15%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton height={14} width="20%" />
          <Skeleton height={14} width="30%" />
          <Skeleton height={14} width="25%" />
          <Skeleton height={14} width="15%" />
        </div>
      ))}
    </div>
  );
}
