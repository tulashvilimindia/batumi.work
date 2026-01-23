/**
 * JobRow Component
 * Table row for displaying a single job in the job listing table
 */

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/date';
import { JobBadges } from './JobBadges';
import type { Job } from '@/types';
import type { Language } from '@/components/ui';

export interface JobRowProps {
  /** Job data */
  job: Job;
  /** Click handler for analytics tracking */
  onClick?: (job: Job) => void;
  /** Additional className for the row */
  className?: string;
}

/**
 * Table row component for a single job
 * Shows title (with VIP orange color), company, published date, and deadline
 * Badges (NEW, Salary) displayed inline with title
 */
export function JobRow({ job, onClick, className }: JobRowProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';

  // Get localized title
  const title = lang === 'en' ? job.title_en : job.title_ge;

  // Format dates
  const publishedDate = formatDateShort(job.published_at, locale);
  const deadlineDate = job.deadline_at ? formatDateShort(job.deadline_at, locale) : '-';

  const handleClick = () => {
    onClick?.(job);
  };

  return (
    <tr
      className={cn(
        'hover:bg-[var(--color-table-row-hover)]',
        'transition-colors duration-150',
        className
      )}
    >
      {/* Title Column (45%) */}
      <td className="p-3 border-b border-[var(--color-table-border)]">
        <Link
          to={`/${lang}/job/${job.external_id}`}
          onClick={handleClick}
          className={cn(
            'text-[var(--color-text-primary)]',
            'hover:text-[var(--color-link)] hover:underline',
            'transition-colors duration-150',
            job.is_vip && 'text-[var(--color-vip)]'
          )}
        >
          {title}
        </Link>
        <JobBadges job={job} size="sm" className="ml-2" />
      </td>

      {/* Company Column (25%) */}
      <td className="p-3 border-b border-[var(--color-table-border)] text-sm text-[var(--color-text-primary)]">
        {job.company_name}
      </td>

      {/* Published Date Column (15%) - Hidden on mobile */}
      <td className="p-3 border-b border-[var(--color-table-border)] text-sm text-[var(--color-text-secondary)] hidden md:table-cell">
        {publishedDate}
      </td>

      {/* Deadline Column (15%) - Hidden on mobile */}
      <td className="p-3 border-b border-[var(--color-table-border)] text-sm text-[var(--color-text-secondary)] hidden md:table-cell">
        {deadlineDate}
      </td>
    </tr>
  );
}

export default JobRow;
