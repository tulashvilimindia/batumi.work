/**
 * Badge Component - Adjarian Folk Edition
 * Traditional styled badges with warm folk colors
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'vip' | 'new' | 'salary' | 'remote';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, { bg: string; text: string; border: string }> = {
  default: {
    bg: 'rgba(107, 68, 35, 0.15)',
    text: '#6B4423',
    border: 'rgba(107, 68, 35, 0.3)',
  },
  success: {
    bg: 'rgba(45, 90, 61, 0.15)',
    text: '#2D5A3D',
    border: 'rgba(45, 90, 61, 0.4)',
  },
  warning: {
    bg: 'rgba(232, 184, 109, 0.2)',
    text: '#8B6B2B',
    border: 'rgba(232, 184, 109, 0.5)',
  },
  error: {
    bg: 'rgba(139, 38, 53, 0.15)',
    text: '#8B2635',
    border: 'rgba(139, 38, 53, 0.4)',
  },
  info: {
    bg: 'rgba(46, 107, 138, 0.15)',
    text: '#2E6B8A',
    border: 'rgba(46, 107, 138, 0.4)',
  },
  vip: {
    bg: 'linear-gradient(135deg, rgba(212, 165, 116, 0.3), rgba(232, 184, 109, 0.3))',
    text: '#6B4423',
    border: '#D4A574',
  },
  new: {
    bg: 'linear-gradient(135deg, rgba(139, 38, 53, 0.2), rgba(168, 60, 75, 0.2))',
    text: '#8B2635',
    border: '#A83C4B',
  },
  salary: {
    bg: 'linear-gradient(135deg, rgba(45, 90, 61, 0.2), rgba(74, 157, 109, 0.2))',
    text: '#2D5A3D',
    border: '#3D7A5D',
  },
  remote: {
    bg: 'rgba(46, 107, 138, 0.15)',
    text: '#2E6B8A',
    border: 'rgba(46, 107, 138, 0.5)',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  const style = variantStyles[variant];
  const isGradient = style.bg.includes('gradient');

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-md',
        'font-semibold tracking-wide',
        'whitespace-nowrap',
        'transition-all duration-200',
        sizeStyles[size],
        className
      )}
      style={{
        background: style.bg,
        color: style.text,
        border: `1.5px solid ${style.border}`,
        fontFamily: 'Source Sans Pro, sans-serif',
        boxShadow: isGradient ? '1px 1px 0 rgba(61, 41, 20, 0.2)' : 'none',
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
