/**
 * Spinner Component - Cyberpunk Neon Edition
 * Animated loading spinner with neon glow effects
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface SpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Spinner color variant */
  color?: 'cyan' | 'pink' | 'purple' | 'green' | 'white' | 'gradient';
  /** Additional className */
  className?: string;
  /** Accessible label */
  label?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorConfig = {
  cyan: {
    primary: '#00F5FF',
    secondary: 'rgba(0, 245, 255, 0.2)',
    glow: 'rgba(0, 245, 255, 0.6)',
  },
  pink: {
    primary: '#FF006E',
    secondary: 'rgba(255, 0, 110, 0.2)',
    glow: 'rgba(255, 0, 110, 0.6)',
  },
  purple: {
    primary: '#8B5CF6',
    secondary: 'rgba(139, 92, 246, 0.2)',
    glow: 'rgba(139, 92, 246, 0.6)',
  },
  green: {
    primary: '#39FF14',
    secondary: 'rgba(57, 255, 20, 0.2)',
    glow: 'rgba(57, 255, 20, 0.6)',
  },
  white: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.2)',
    glow: 'rgba(255, 255, 255, 0.4)',
  },
  gradient: {
    primary: 'url(#neon-gradient)',
    secondary: 'rgba(0, 245, 255, 0.1)',
    glow: 'rgba(0, 245, 255, 0.5)',
  },
};

const borderWidths = {
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
};

/**
 * Cyberpunk Neon Spinner with glowing animation
 */
export function Spinner({
  size = 'md',
  color = 'cyan',
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
        {/* Outer glow ring */}
        <div
          className={cn('absolute inset-0 rounded-full animate-pulse', sizeStyles[size])}
          style={{
            boxShadow: `0 0 20px ${config.glow}, 0 0 40px ${config.glow}`,
          }}
        />

        {/* Main spinner */}
        <svg
          className={cn('animate-spin', sizeStyles[size])}
          viewBox="0 0 50 50"
          style={{
            filter: `drop-shadow(0 0 10px ${config.glow})`,
          }}
        >
          {/* Gradient definition for gradient variant */}
          {color === 'gradient' && (
            <defs>
              <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F5FF" />
                <stop offset="50%" stopColor="#FF006E" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          )}

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

        {/* Center pulse dot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
          style={{
            width: size === 'sm' ? 2 : size === 'md' ? 4 : size === 'lg' ? 6 : 8,
            height: size === 'sm' ? 2 : size === 'md' ? 4 : size === 'lg' ? 6 : 8,
            background: color === 'gradient' ? '#FF006E' : config.primary,
            boxShadow: `0 0 10px ${config.glow}`,
          }}
        />
      </div>

      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Full-page loading overlay with neon spinner
 */
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
        'bg-bg-dark/90 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" color="gradient" />
        <p
          className="text-sm tracking-[0.3em] uppercase text-neon-cyan"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            textShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
            animation: 'pulse-glow 2s ease-in-out infinite',
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
