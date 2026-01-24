/**
 * JobRow Component - Adjarian Folk Edition
 * Warm card with traditional hover effects
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
        'group relative transition-all duration-200',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? 'linear-gradient(90deg, rgba(212, 165, 116, 0.1), transparent)'
          : 'transparent',
      }}
    >
      {/* Title Column */}
      <td
        className="p-4 relative"
        style={{
          borderBottom: '1px solid rgba(196, 164, 132, 0.3)',
        }}
      >
        {/* Gold indicator for VIP */}
        {job.is_vip && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full"
            style={{ background: '#D4A574' }}
          />
        )}

        <div className="flex items-center gap-2">
          <Link
            to={`/${lang}/job/${job.external_id}`}
            onClick={handleClick}
            className="font-medium transition-colors duration-200"
            style={{
              fontFamily: 'Source Sans Pro, sans-serif',
              color: job.is_vip
                ? '#8B6B2B'
                : isHovered
                ? '#8B2635'
                : '#3D2914',
            }}
          >
            {title}
          </Link>
          <JobBadges job={job} size="sm" />
        </div>

        {/* Mobile: show company below title */}
        <div
          className="md:hidden mt-1 text-xs"
          style={{ color: '#8B6B4B' }}
        >
          {job.company_name}
        </div>
      </td>

      {/* Company Column */}
      <td
        className="p-4 hidden md:table-cell"
        style={{
          borderBottom: '1px solid rgba(196, 164, 132, 0.3)',
        }}
      >
        <span
          className="text-sm transition-colors duration-200"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: isHovered ? '#2D5A3D' : '#6B4423',
          }}
        >
          {job.company_name}
        </span>
      </td>

      {/* Published Date Column */}
      <td
        className="p-4 hidden md:table-cell"
        style={{
          borderBottom: '1px solid rgba(196, 164, 132, 0.3)',
        }}
      >
        <span
          className="text-sm"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: '#8B6B4B',
          }}
        >
          {publishedDate}
        </span>
      </td>

      {/* Deadline Column */}
      <td
        className="p-4 hidden md:table-cell"
        style={{
          borderBottom: '1px solid rgba(196, 164, 132, 0.3)',
        }}
      >
        <span
          className="text-sm"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: deadlineDate !== '-' ? '#8B2635' : '#8B6B4B',
            fontWeight: deadlineDate !== '-' ? 500 : 400,
          }}
        >
          {deadlineDate}
        </span>
      </td>
    </tr>
  );
}

export default JobRow;
