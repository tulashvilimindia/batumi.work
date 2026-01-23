/**
 * JobTable Component
 * Table-based layout for displaying job listings
 * Matches the current frontend's table design
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { JobRow } from './JobRow';
import type { Job } from '@/types';
import type { Language } from '@/components/ui';

export interface JobTableProps {
  /** Array of jobs to display */
  jobs: Job[];
  /** Loading state */
  isLoading?: boolean;
  /** Number of skeleton rows to show when loading */
  skeletonCount?: number;
  /** Callback when a job row is clicked */
  onJobClick?: (job: Job, index: number) => void;
  /** Additional className */
  className?: string;
}

// Translations for table headers
const translations = {
  ge: {
    jobTitle: 'განცხადება',
    company: 'კომპანია',
    published: 'გამოქვეყნდა',
    deadline: 'ბოლო ვადა',
  },
  en: {
    jobTitle: 'Job Title',
    company: 'Company',
    published: 'Published',
    deadline: 'Deadline',
  },
};

/**
 * Skeleton row for loading state
 */
function JobRowSkeleton() {
  return (
    <tr>
      <td className="p-3 border-b border-[var(--color-table-border)]">
        <Skeleton variant="text" width="70%" className="h-4 mb-1" />
        <div className="flex gap-1 mt-1">
          <Skeleton variant="rectangular" width={30} height={16} />
          <Skeleton variant="rectangular" width={20} height={16} />
        </div>
      </td>
      <td className="p-3 border-b border-[var(--color-table-border)]">
        <Skeleton variant="text" width="60%" className="h-4" />
      </td>
      <td className="p-3 border-b border-[var(--color-table-border)] hidden md:table-cell">
        <Skeleton variant="text" width="80%" className="h-4" />
      </td>
      <td className="p-3 border-b border-[var(--color-table-border)] hidden md:table-cell">
        <Skeleton variant="text" width="80%" className="h-4" />
      </td>
    </tr>
  );
}

/**
 * JobTable component displays jobs in a table format
 * 4 columns: Title (45%), Company (25%), Published (15%), Deadline (15%)
 * Date columns are hidden on mobile
 */
export function JobTable({
  jobs,
  isLoading = false,
  skeletonCount = 10,
  onJobClick,
  className,
}: JobTableProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const t = translations[lang === 'en' ? 'en' : 'ge'];

  const handleJobClick = (job: Job, index: number) => {
    onJobClick?.(job, index);
  };

  return (
    <div
      className={cn(
        'bg-[var(--color-table-bg)]',
        'border border-[var(--color-table-border-outer)]',
        'rounded',
        'overflow-x-auto',
        className
      )}
    >
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr className="bg-[var(--color-table-header-bg)]">
            <th
              scope="col"
              className={cn(
                'w-[45%] md:w-[45%]',
                'p-3 text-left',
                'text-[var(--color-text-secondary)]',
                'text-sm font-normal',
                'border-b border-[var(--color-border)]'
              )}
            >
              {t.jobTitle}
            </th>
            <th
              scope="col"
              className={cn(
                'w-[55%] md:w-[25%]',
                'p-3 text-left',
                'text-[var(--color-text-secondary)]',
                'text-sm font-normal',
                'border-b border-[var(--color-border)]'
              )}
            >
              {t.company}
            </th>
            <th
              scope="col"
              className={cn(
                'w-[15%]',
                'p-3 text-left',
                'text-[var(--color-text-secondary)]',
                'text-sm font-normal',
                'border-b border-[var(--color-border)]',
                'hidden md:table-cell'
              )}
            >
              {t.published}
            </th>
            <th
              scope="col"
              className={cn(
                'w-[15%]',
                'p-3 text-left',
                'text-[var(--color-text-secondary)]',
                'text-sm font-normal',
                'border-b border-[var(--color-border)]',
                'hidden md:table-cell'
              )}
            >
              {t.deadline}
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // Show skeleton rows when loading
            Array.from({ length: skeletonCount }).map((_, index) => (
              <JobRowSkeleton key={`skeleton-${index}`} />
            ))
          ) : jobs.length > 0 ? (
            // Show job rows
            jobs.map((job, index) => (
              <JobRow
                key={job.id}
                job={job}
                onClick={() => handleJobClick(job, index)}
              />
            ))
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default JobTable;
