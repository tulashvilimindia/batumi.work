/**
 * ErrorState Component - Cyberpunk Neon Edition
 * Error display with neon warning effects
 */

import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, Zap } from 'lucide-react';
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
 * Cyberpunk ErrorState component with neon warning effects
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

  const defaultTitle = isOffline ? "You're offline" : 'System Error';
  const defaultDescription = isOffline
    ? 'Check your network connection and try again.'
    : "We couldn't load the content. Please try again.";

  const displayTitle = title || defaultTitle;
  const displayDescription = description || (error?.message ?? defaultDescription);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'text-center',
        'py-16 px-6',
        'relative',
        className
      )}
      role="alert"
    >
      {/* Background warning glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 0, 110, 0.2), transparent 60%)',
        }}
      />

      {/* Glitch effect bars */}
      <div
        className="absolute top-1/4 left-0 right-0 h-[2px] opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, #FF006E, transparent)',
          animation: 'glitch-bar 2s ease-in-out infinite',
        }}
      />

      {/* Icon Container */}
      <div
        className="relative flex items-center justify-center w-24 h-24 mb-6 rounded-2xl"
        style={{
          background: 'rgba(255, 0, 110, 0.1)',
          border: '1px solid rgba(255, 0, 110, 0.3)',
          boxShadow: '0 0 30px rgba(255, 0, 110, 0.2), inset 0 0 30px rgba(255, 0, 110, 0.05)',
          animation: 'pulse-glow-error 2s ease-in-out infinite',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-[2px] bg-neon-pink" style={{ boxShadow: '0 0 5px #FF006E' }} />
        <div className="absolute top-0 left-0 w-[2px] h-4 bg-neon-pink" style={{ boxShadow: '0 0 5px #FF006E' }} />
        <div className="absolute top-0 right-0 w-4 h-[2px] bg-neon-pink" style={{ boxShadow: '0 0 5px #FF006E' }} />
        <div className="absolute top-0 right-0 w-[2px] h-4 bg-neon-pink" style={{ boxShadow: '0 0 5px #FF006E' }} />
        <div className="absolute bottom-0 left-0 w-4 h-[2px] bg-neon-pink" style={{ boxShadow: '0 0 5px #FF006E' }} />
        <div className="absolute bottom-0 left-0 w-[2px] h-4 bg-neon-pink" style={{ boxShadow: '0 0 5px #FF006E' }} />
        <div className="absolute bottom-0 right-0 w-4 h-[2px] bg-neon-pink" style={{ boxShadow: '0 0 5px #FF006E' }} />
        <div className="absolute bottom-0 right-0 w-[2px] h-4 bg-neon-pink" style={{ boxShadow: '0 0 5px #FF006E' }} />

        {/* Icon */}
        <div
          className="text-neon-pink"
          style={{
            filter: 'drop-shadow(0 0 15px rgba(255, 0, 110, 0.8))',
          }}
          aria-hidden="true"
        >
          <Icon size={40} />
        </div>

        {/* Warning sparks */}
        <Zap
          size={16}
          className="absolute -top-2 -right-2 text-neon-yellow animate-pulse"
          style={{ filter: 'drop-shadow(0 0 5px #FFE600)' }}
        />
      </div>

      {/* Error Code Label */}
      <div
        className="mb-2 px-3 py-1 rounded text-xs tracking-[0.3em] uppercase"
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          background: 'rgba(255, 0, 110, 0.1)',
          border: '1px solid rgba(255, 0, 110, 0.3)',
          color: '#FF006E',
        }}
      >
        {isOffline ? 'OFFLINE' : 'ERROR'}
      </div>

      {/* Title */}
      <h3
        className="text-xl font-bold mb-3"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          color: '#FF006E',
          textShadow: '0 0 20px rgba(255, 0, 110, 0.5)',
        }}
      >
        {displayTitle}
      </h3>

      {/* Description */}
      <p
        className="text-sm max-w-md mb-8 tracking-wider"
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          color: '#A0A0B0',
        }}
      >
        {displayDescription}
      </p>

      {/* Retry button */}
      {retry && (
        <Button
          variant="neon-pink"
          onClick={retry}
          leftIcon={<RefreshCw size={18} />}
        >
          Try Again
        </Button>
      )}

      {/* Decorative glitch line */}
      <div
        className="absolute bottom-1/4 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 0, 110, 0.5), transparent)',
        }}
      />
    </div>
  );
}

export default ErrorState;
