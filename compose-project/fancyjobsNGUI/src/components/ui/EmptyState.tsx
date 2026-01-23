/**
 * EmptyState Component - Cyberpunk Neon Edition
 * Empty state display with neon effects
 */

import React from 'react';
import { Search, Inbox, FileQuestion } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Icon variant for default icons */
  iconVariant?: 'search' | 'inbox' | 'file';
  /** Main title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional primary action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional className */
  className?: string;
}

const defaultIcons = {
  search: Search,
  inbox: Inbox,
  file: FileQuestion,
};

/**
 * Cyberpunk EmptyState component with neon glow effects
 */
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
      {/* Background glow effect */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.1), transparent 60%)',
        }}
      />

      {/* Icon Container */}
      <div
        className="relative flex items-center justify-center w-24 h-24 mb-6 rounded-2xl"
        style={{
          background: 'rgba(10, 10, 20, 0.6)',
          border: '1px solid rgba(0, 245, 255, 0.2)',
          boxShadow: '0 0 30px rgba(0, 245, 255, 0.1), inset 0 0 30px rgba(0, 245, 255, 0.05)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-[1px] bg-neon-cyan" />
        <div className="absolute top-0 left-0 w-[1px] h-4 bg-neon-cyan" />
        <div className="absolute bottom-0 right-0 w-4 h-[1px] bg-neon-pink" />
        <div className="absolute bottom-0 right-0 w-[1px] h-4 bg-neon-pink" />

        {/* Icon */}
        <div
          className="text-neon-cyan"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(0, 245, 255, 0.6))',
          }}
          aria-hidden="true"
        >
          {icon || <IconComponent size={40} />}
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-xl font-bold mb-3"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          background: 'linear-gradient(135deg, #00F5FF, #8B5CF6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="text-sm max-w-md mb-8 tracking-wider"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: '#A0A0B0',
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

      {/* Decorative scan line */}
      <div
        className="absolute bottom-0 left-1/4 right-1/4 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.3), transparent)',
        }}
      />
    </div>
  );
}

export default EmptyState;
