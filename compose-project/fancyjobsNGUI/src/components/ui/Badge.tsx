/**
 * Badge Component - Cyberpunk Neon Edition
 * Glowing badges with neon effects
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'vip' | 'new' | 'salary' | 'remote';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, { classes: string; glow: string }> = {
  default: {
    classes: 'bg-white/5 text-text-secondary border-white/10',
    glow: 'none',
  },
  success: {
    classes: 'bg-neon-green/10 text-neon-green border-neon-green/30',
    glow: '0 0 10px rgba(57, 255, 20, 0.4)',
  },
  warning: {
    classes: 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30',
    glow: '0 0 10px rgba(255, 230, 0, 0.4)',
  },
  error: {
    classes: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30',
    glow: '0 0 10px rgba(255, 0, 110, 0.4)',
  },
  info: {
    classes: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
    glow: '0 0 10px rgba(0, 212, 255, 0.4)',
  },
  vip: {
    classes: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50 font-bold',
    glow: '0 0 15px rgba(255, 230, 0, 0.6)',
  },
  new: {
    classes: 'bg-neon-pink/20 text-neon-pink border-neon-pink/50 font-bold',
    glow: '0 0 15px rgba(255, 0, 110, 0.6)',
  },
  salary: {
    classes: 'bg-neon-green/20 text-neon-green border-neon-green/50 font-bold',
    glow: '0 0 15px rgba(57, 255, 20, 0.6)',
  },
  remote: {
    classes: 'bg-neon-purple/20 text-neon-purple border-neon-purple/50',
    glow: '0 0 15px rgba(139, 92, 246, 0.6)',
  },
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[9px]',
  md: 'px-2 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  const style = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'rounded border',
        'uppercase tracking-wider',
        'whitespace-nowrap',
        'transition-all duration-300',
        style.classes,
        sizeStyles[size],
        className
      )}
      style={{
        boxShadow: style.glow,
        fontFamily: 'Rajdhani, sans-serif',
        textShadow: variant !== 'default' ? '0 0 5px currentColor' : 'none',
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
