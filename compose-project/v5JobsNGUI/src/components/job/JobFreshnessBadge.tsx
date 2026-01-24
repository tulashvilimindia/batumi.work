/**
 * JobFreshnessBadge Component - V5 Feature
 * Enhanced freshness indicator with multiple levels
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getFreshnessLevel, getFreshnessLabel, type FreshnessLevel } from '@/lib/date';
import type { Language } from '@/components/ui';

export interface JobFreshnessBadgeProps {
  publishedAt: string | Date;
  compact?: boolean;
  className?: string;
}

const freshnessStyles: Record<FreshnessLevel, { bg: string; text: string; border: string; pulse?: boolean }> = {
  'just-posted': {
    bg: 'linear-gradient(135deg, #8B2635, #A83C4B)',
    text: '#F5E6D3',
    border: '#D4A574',
    pulse: true,
  },
  'today': {
    bg: 'linear-gradient(135deg, #2D5A3D, #3D7A5D)',
    text: '#F5E6D3',
    border: '#4A9D6D',
  },
  'new': {
    bg: 'linear-gradient(135deg, rgba(139, 38, 53, 0.2), rgba(168, 60, 75, 0.2))',
    text: '#8B2635',
    border: '#A83C4B',
  },
  'recent': {
    bg: 'rgba(212, 165, 116, 0.2)',
    text: '#6B4423',
    border: '#D4A574',
  },
  'normal': {
    bg: 'transparent',
    text: 'transparent',
    border: 'transparent',
  },
};

export function JobFreshnessBadge({ publishedAt, compact = false, className }: JobFreshnessBadgeProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';

  const level = getFreshnessLevel(publishedAt);
  const label = getFreshnessLabel(publishedAt, locale);

  // Don't render for normal level
  if (level === 'normal' || !label) {
    return null;
  }

  const style = freshnessStyles[level];

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-md transition-all',
        compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
        style.pulse && 'animate-pulse',
        className
      )}
      style={{
        background: style.bg,
        color: style.text,
        border: `1.5px solid ${style.border}`,
      }}
    >
      {level === 'just-posted' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 animate-ping" />
      )}
      {label}
    </span>
  );
}

export default JobFreshnessBadge;
