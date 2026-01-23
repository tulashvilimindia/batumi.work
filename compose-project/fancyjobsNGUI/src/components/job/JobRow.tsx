/**
 * JobRow Component - Cyberpunk Neon Edition
 * Glassmorphic card with neon glow effects
 */

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/date';
import { JobBadges } from './JobBadges';
import type { Job } from '@/types';
import type { Language } from '@/components/ui';

export interface JobRowProps {
  job: Job;
  onClick?: (job: Job) => void;
  className?: string;
}

export function JobRow({ job, onClick, className }: JobRowProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const [isHovered, setIsHovered] = useState(false);

  const title = lang === 'en' ? job.title_en : job.title_ge;
  const publishedDate = formatDateShort(job.published_at, locale);
  const deadlineDate = job.deadline_at ? formatDateShort(job.deadline_at, locale) : '-';

  const handleClick = () => {
    onClick?.(job);
  };

  return (
    <tr
      className={cn(
        'group relative transition-all duration-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, rgba(0, 245, 255, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)'
          : 'transparent',
      }}
    >
      {/* Title Column */}
      <td className="p-4 border-b border-white/5 relative">
        {/* Neon indicator for VIP */}
        {job.is_vip && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-neon-yellow"
            style={{ boxShadow: '0 0 10px rgba(255, 230, 0, 0.8)' }}
          />
        )}

        <div className="flex items-center gap-2">
          <Link
            to={`/${lang}/job/${job.external_id}`}
            onClick={handleClick}
            className={cn(
              'font-medium transition-all duration-300',
              job.is_vip
                ? 'text-neon-yellow'
                : 'text-text-primary group-hover:text-neon-cyan',
            )}
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              textShadow: isHovered ? '0 0 10px rgba(0, 245, 255, 0.5)' : 'none',
            }}
          >
            {title}
          </Link>
          <JobBadges job={job} size="sm" />
        </div>

        {/* Mobile: show company below title */}
        <div className="md:hidden mt-1 text-xs text-text-tertiary">
          {job.company_name}
        </div>
      </td>

      {/* Company Column */}
      <td className="p-4 border-b border-white/5 hidden md:table-cell">
        <span
          className="text-sm text-text-secondary group-hover:text-neon-purple transition-colors duration-300"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {job.company_name}
        </span>
      </td>

      {/* Published Date Column */}
      <td className="p-4 border-b border-white/5 hidden md:table-cell">
        <span className="text-sm text-text-tertiary font-mono">
          {publishedDate}
        </span>
      </td>

      {/* Deadline Column */}
      <td className="p-4 border-b border-white/5 hidden md:table-cell">
        <span
          className={cn(
            'text-sm font-mono',
            deadlineDate !== '-' ? 'text-neon-orange' : 'text-text-tertiary'
          )}
          style={{
            textShadow: deadlineDate !== '-' ? '0 0 8px rgba(255, 107, 53, 0.4)' : 'none'
          }}
        >
          {deadlineDate}
        </span>
      </td>

      {/* Hover glow effect */}
      {isHovered && (
        <td
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 30px rgba(0, 245, 255, 0.05)',
          }}
        />
      )}
    </tr>
  );
}

export default JobRow;
