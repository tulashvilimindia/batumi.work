/**
 * ErrorState Component - Adjarian Folk Edition
 * Error display with warm traditional styling
 */

import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  error?: Error | null;
  title?: string;
  description?: string;
  retry?: () => void;
  isOffline?: boolean;
  className?: string;
}

export function ErrorState({
  error,
  title,
  description,
  retry,
  isOffline = false,
  className,
}: ErrorStateProps) {
  const Icon = isOffline ? WifiOff : AlertTriangle;

  const defaultTitle = isOffline ? 'კავშირი გაწყვეტილია' : 'შეცდომა';
  const defaultDescription = isOffline
    ? 'შეამოწმეთ ინტერნეტ კავშირი და სცადეთ ხელახლა.'
    : 'კონტენტის ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.';

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
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #8B2635 1px, transparent 1px),
            linear-gradient(-45deg, #8B2635 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Icon Container */}
      <div
        className="relative flex items-center justify-center w-24 h-24 mb-6 rounded-lg"
        style={{
          background: 'rgba(139, 38, 53, 0.1)',
          border: '2px solid rgba(139, 38, 53, 0.3)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-[2px] bg-[#8B2635]" />
        <div className="absolute top-0 left-0 w-[2px] h-3 bg-[#8B2635]" />
        <div className="absolute top-0 right-0 w-3 h-[2px] bg-[#8B2635]" />
        <div className="absolute top-0 right-0 w-[2px] h-3 bg-[#8B2635]" />
        <div className="absolute bottom-0 left-0 w-3 h-[2px] bg-[#8B2635]" />
        <div className="absolute bottom-0 left-0 w-[2px] h-3 bg-[#8B2635]" />
        <div className="absolute bottom-0 right-0 w-3 h-[2px] bg-[#8B2635]" />
        <div className="absolute bottom-0 right-0 w-[2px] h-3 bg-[#8B2635]" />

        {/* Icon */}
        <div aria-hidden="true" style={{ color: '#8B2635' }}>
          <Icon size={40} />
        </div>
      </div>

      {/* Error Label */}
      <div
        className="mb-2 px-3 py-1 rounded-md text-xs tracking-wide uppercase font-semibold"
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          background: 'rgba(139, 38, 53, 0.1)',
          border: '1px solid rgba(139, 38, 53, 0.3)',
          color: '#8B2635',
        }}
      >
        {isOffline ? 'OFFLINE' : 'ERROR'}
      </div>

      {/* Title */}
      <h3
        className="text-xl font-bold mb-3"
        style={{
          fontFamily: 'Playfair Display, serif',
          color: '#8B2635',
        }}
      >
        {displayTitle}
      </h3>

      {/* Description */}
      <p
        className="text-sm max-w-md mb-8"
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          color: '#8B6B4B',
        }}
      >
        {displayDescription}
      </p>

      {/* Retry button */}
      {retry && (
        <Button
          variant="primary"
          onClick={retry}
          leftIcon={<RefreshCw size={18} />}
        >
          ხელახლა ცდა
        </Button>
      )}

      {/* Decorative line */}
      <div
        className="absolute bottom-1/4 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139, 38, 53, 0.3), transparent)',
        }}
      />
    </div>
  );
}

export default ErrorState;
