/**
 * LoadingState Component - Cyberpunk Neon Edition
 * Loading displays with neon spinner and skeleton effects
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
  spinnerColor?: 'cyan' | 'pink' | 'purple' | 'gradient';
  /** Additional className */
  className?: string;
}

/**
 * Cyberpunk LoadingState component with neon effects
 */
export function LoadingState({
  message,
  fullScreen = false,
  variant = 'spinner',
  count = 6,
  spinnerColor = 'gradient',
  className,
}: LoadingStateProps) {
  // Full screen overlay
  if (fullScreen) {
    return <LoadingOverlay label={message || 'Loading...'} className={className} />;
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
            background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.1), transparent 60%)',
          }}
        />

        <Spinner size="lg" color={spinnerColor} />

        {message && (
          <p
            className="mt-6 text-sm tracking-[0.2em] uppercase"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              color: '#00F5FF',
              textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          >
            {message}
          </p>
        )}

        {/* Decorative scan lines */}
        <div
          className="absolute bottom-0 left-1/4 right-1/4 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.3), transparent)',
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
        aria-label="Loading jobs"
      >
        <JobListSkeleton count={count} />

        {/* Overlay with message */}
        {message && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(10, 10, 20, 0.8))',
            }}
          >
            <p
              className="text-sm tracking-[0.2em] uppercase px-4 py-2 rounded-lg"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                color: '#00F5FF',
                background: 'rgba(10, 10, 20, 0.9)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
              }}
            >
              {message}
            </p>
          </div>
        )}
        <span className="sr-only">{message || 'Loading jobs...'}</span>
      </div>
    );
  }

  // Generic skeleton variant
  return (
    <div
      className={cn('space-y-4 p-4', className)}
      role="status"
      aria-label="Loading content"
      style={{
        background: 'rgba(10, 10, 20, 0.4)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 245, 255, 0.1)',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="80%" color="cyan" />
          <Skeleton variant="text" width="60%" color="purple" />
        </div>
      ))}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );
}

/**
 * Inline loading indicator for buttons and small areas
 */
export function InlineLoader({
  size = 'sm',
  color = 'cyan',
  className,
}: {
  size?: 'sm' | 'md';
  color?: 'cyan' | 'pink' | 'white';
  className?: string;
}) {
  return (
    <Spinner
      size={size}
      color={color}
      className={className}
      label="Loading"
    />
  );
}

export default LoadingState;
