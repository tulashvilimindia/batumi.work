/**
 * Spinner Component - Adjarian Folk Edition
 * Warm animated loading spinner with traditional colors
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'red' | 'green' | 'gold' | 'brown' | 'default';
  className?: string;
  label?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorConfig = {
  red: {
    primary: '#8B2635',
    secondary: 'rgba(139, 38, 53, 0.2)',
  },
  green: {
    primary: '#2D5A3D',
    secondary: 'rgba(45, 90, 61, 0.2)',
  },
  gold: {
    primary: '#D4A574',
    secondary: 'rgba(212, 165, 116, 0.2)',
  },
  brown: {
    primary: '#6B4423',
    secondary: 'rgba(107, 68, 35, 0.2)',
  },
  default: {
    primary: '#8B2635',
    secondary: 'rgba(212, 165, 116, 0.3)',
  },
};

const borderWidths = {
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
};

export function Spinner({
  size = 'md',
  color = 'default',
  className,
  label = 'Loading...',
}: SpinnerProps) {
  const config = colorConfig[color];
  const borderWidth = borderWidths[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center justify-center', className)}
    >
      <div className="relative">
        {/* Main spinner */}
        <svg
          className={cn('animate-spin', sizeStyles[size])}
          viewBox="0 0 50 50"
        >
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={config.secondary}
            strokeWidth={borderWidth}
          />

          {/* Spinning arc */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={config.primary}
            strokeWidth={borderWidth}
            strokeLinecap="round"
            strokeDasharray="80, 200"
            strokeDashoffset="0"
          />
        </svg>

        {/* Center decorative dot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size === 'sm' ? 2 : size === 'md' ? 4 : size === 'lg' ? 6 : 8,
            height: size === 'sm' ? 2 : size === 'md' ? 4 : size === 'lg' ? 6 : 8,
            background: '#D4A574',
          }}
        />
      </div>

      <span className="sr-only">{label}</span>
    </div>
  );
}

export function LoadingOverlay({
  label = 'Loading...',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        className
      )}
      style={{
        background: 'rgba(253, 248, 243, 0.95)',
        backdropFilter: 'blur(4px)',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" color="default" />
        <p
          className="text-sm tracking-wide"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: '#6B4423',
          }}
        >
          {label}
        </p>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Spinner;
