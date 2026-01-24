/**
 * LoadingState Component - Adjarian Folk Edition
 * Loading displays with warm spinner and skeleton effects
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner, LoadingOverlay } from './Spinner';
import { Skeleton, JobCardSkeleton, JobListSkeleton } from './Skeleton';

export interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /** Display as full screen overlay */
  fullScreen?: boolean;
  /** Type of loading indicator */
  variant?: 'spinner' | 'skeleton' | 'jobCards';
  /** Number of skeleton items (for skeleton/jobCards variant) */
  count?: number;
  /** Spinner color */
  spinnerColor?: 'brown' | 'gold' | 'green' | 'red' | 'default';
  /** Additional className */
  className?: string;
}

/**
 * Adjarian Folk LoadingState component with warm effects
 */
export function LoadingState({
  message,
  fullScreen = false,
  variant = 'spinner',
  count = 6,
  spinnerColor = 'gold',
  className,
}: LoadingStateProps) {
  // Full screen overlay
  if (fullScreen) {
    return <LoadingOverlay label={message || 'იტვირთება...'} className={className} />;
  }

  // Spinner variant
  if (variant === 'spinner') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'py-16',
          'relative',
          className
        )}
        role="status"
        aria-live="polite"
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(212, 165, 116, 0.2), transparent 60%)',
          }}
        />

        <Spinner size="lg" color={spinnerColor} />

        {message && (
          <p
            className="mt-6 text-sm tracking-wide"
            style={{
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#6B4423',
            }}
          >
            {message}
          </p>
        )}

        {/* Decorative line */}
        <div
          className="absolute bottom-0 left-1/4 right-1/4 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.4), transparent)',
          }}
        />
      </div>
    );
  }

  // Job cards skeleton variant
  if (variant === 'jobCards') {
    return (
      <div
        className={cn('relative', className)}
        role="status"
        aria-label="იტვირთება სამუშაოები"
      >
        <JobListSkeleton count={count} />

        {/* Overlay with message */}
        {message && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(253, 248, 243, 0.9))',
            }}
          >
            <p
              className="text-sm tracking-wide px-4 py-2 rounded-lg"
              style={{
                fontFamily: 'Source Sans Pro, sans-serif',
                color: '#6B4423',
                background: 'rgba(255, 250, 245, 0.95)',
                border: '1px solid rgba(212, 165, 116, 0.4)',
              }}
            >
              {message}
            </p>
          </div>
        )}
        <span className="sr-only">{message || 'იტვირთება სამუშაოები...'}</span>
      </div>
    );
  }

  // Generic skeleton variant
  return (
    <div
      className={cn('space-y-4 p-4', className)}
      role="status"
      aria-label="იტვირთება"
      style={{
        background: 'rgba(255, 250, 245, 0.6)',
        borderRadius: '8px',
        border: '1px solid rgba(212, 165, 116, 0.3)',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="80%" color="gold" />
          <Skeleton variant="text" width="60%" color="green" />
        </div>
      ))}
      <span className="sr-only">{message || 'იტვირთება...'}</span>
    </div>
  );
}

/**
 * Inline loading indicator for buttons and small areas
 */
export function InlineLoader({
  size = 'sm',
  color = 'gold',
  className,
}: {
  size?: 'sm' | 'md';
  color?: 'brown' | 'gold' | 'green' | 'red' | 'default';
  className?: string;
}) {
  return (
    <Spinner
      size={size}
      color={color}
      className={className}
      label="იტვირთება"
    />
  );
}

export default LoadingState;
