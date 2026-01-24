/**
 * EmptyState Component - Adjarian Folk Edition
 * Empty state display with warm traditional styling
 */

import React from 'react';
import { Search, Inbox, FileQuestion } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  iconVariant?: 'search' | 'inbox' | 'file';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultIcons = {
  search: Search,
  inbox: Inbox,
  file: FileQuestion,
};

export function EmptyState({
  icon,
  iconVariant = 'search',
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const IconComponent = defaultIcons[iconVariant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'text-center',
        'py-16 px-6',
        'relative',
        className
      )}
      role="status"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #D4A574 1px, transparent 1px),
            linear-gradient(-45deg, #D4A574 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Icon Container */}
      <div
        className="relative flex items-center justify-center w-24 h-24 mb-6 rounded-lg"
        style={{
          background: 'rgba(212, 165, 116, 0.1)',
          border: '2px solid rgba(212, 165, 116, 0.3)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-[2px] bg-[#8B2635]" />
        <div className="absolute top-0 left-0 w-[2px] h-3 bg-[#8B2635]" />
        <div className="absolute bottom-0 right-0 w-3 h-[2px] bg-[#2D5A3D]" />
        <div className="absolute bottom-0 right-0 w-[2px] h-3 bg-[#2D5A3D]" />

        {/* Icon */}
        <div aria-hidden="true" style={{ color: '#6B4423' }}>
          {icon || <IconComponent size={40} />}
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-xl font-bold mb-3"
        style={{
          fontFamily: 'Playfair Display, serif',
          color: '#3D2914',
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="text-sm max-w-md mb-8"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: '#8B6B4B',
          }}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
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

export default EmptyState;
