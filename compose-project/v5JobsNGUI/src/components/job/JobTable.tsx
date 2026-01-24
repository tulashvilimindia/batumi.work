/**
 * JobTable Component - Adjarian Folk Edition
 * Mobile-first responsive table with warm styling
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { JobRow } from './JobRow';
import type { Job } from '@/types';
import type { Language } from '@/components/ui';

export interface JobTableProps {
  jobs: Job[];
  isLoading?: boolean;
  skeletonCount?: number;
  onJobClick?: (job: Job, index: number) => void;
  className?: string;
}

const translations = {
  ge: {
    jobTitle: 'ვაკანსია',
    company: 'კომპანია',
    published: 'თარიღი',
    deadline: 'ბოლო ვადა',
  },
  en: {
    jobTitle: 'Position',
    company: 'Company',
    published: 'Date',
    deadline: 'Deadline',
  },
};

function JobRowSkeleton() {
  return (
    <tr>
      {/* Mobile skeleton */}
      <td className="p-3 md:p-4 md:hidden" style={{ borderBottom: '1px solid rgba(196, 164, 132, 0.3)' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div
              className="h-4 rounded-md w-4/5 mb-2"
              style={{ background: 'rgba(212, 165, 116, 0.25)' }}
            />
            <div
              className="h-3 rounded-md w-1/2"
              style={{ background: 'rgba(107, 68, 35, 0.15)' }}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div
              className="h-4 w-10 rounded"
              style={{ background: 'rgba(139, 38, 53, 0.15)' }}
            />
            <div
              className="h-3 w-12 rounded"
              style={{ background: 'rgba(139, 107, 75, 0.1)' }}
            />
          </div>
        </div>
      </td>
      {/* Desktop skeleton */}
      <td className="p-4 hidden md:table-cell" style={{ borderBottom: '1px solid rgba(196, 164, 132, 0.3)' }}>
        <div
          className="h-4 rounded-md w-3/4 mb-2"
          style={{ background: 'rgba(212, 165, 116, 0.2)' }}
        />
        <div className="flex gap-2">
          <div
            className="h-4 w-12 rounded-md"
            style={{ background: 'rgba(139, 38, 53, 0.15)' }}
          />
          <div
            className="h-4 w-8 rounded-md"
            style={{ background: 'rgba(45, 90, 61, 0.15)' }}
          />
        </div>
      </td>
      <td className="p-4 hidden md:table-cell" style={{ borderBottom: '1px solid rgba(196, 164, 132, 0.3)' }}>
        <div
          className="h-4 rounded-md w-2/3"
          style={{ background: 'rgba(107, 68, 35, 0.15)' }}
        />
      </td>
      <td className="p-4 hidden md:table-cell" style={{ borderBottom: '1px solid rgba(196, 164, 132, 0.3)' }}>
        <div
          className="h-4 rounded-md w-16"
          style={{ background: 'rgba(139, 107, 75, 0.15)' }}
        />
      </td>
      <td className="p-4 hidden md:table-cell" style={{ borderBottom: '1px solid rgba(196, 164, 132, 0.3)' }}>
        <div
          className="h-4 rounded-md w-16"
          style={{ background: 'rgba(139, 38, 53, 0.1)' }}
        />
      </td>
    </tr>
  );
}

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
        'relative',
        'rounded-lg',
        className
      )}
      style={{
        background: '#FFFAF5',
        border: '2px solid #D4A574',
        boxShadow: '4px 4px 0 #3D2914',
      }}
    >
      {/* Decorative corners - hidden on mobile */}
      <div className="hidden md:block">
        <div className="absolute top-0 left-0 w-4 h-4">
          <div className="absolute top-0 left-0 w-3 h-[2px] bg-[#8B2635]" />
          <div className="absolute top-0 left-0 w-[2px] h-3 bg-[#8B2635]" />
        </div>
        <div className="absolute top-0 right-0 w-4 h-4">
          <div className="absolute top-0 right-0 w-3 h-[2px] bg-[#2D5A3D]" />
          <div className="absolute top-0 right-0 w-[2px] h-3 bg-[#2D5A3D]" />
        </div>
        <div className="absolute bottom-0 left-0 w-4 h-4">
          <div className="absolute bottom-0 left-0 w-3 h-[2px] bg-[#2D5A3D]" />
          <div className="absolute bottom-0 left-0 w-[2px] h-3 bg-[#2D5A3D]" />
        </div>
        <div className="absolute bottom-0 right-0 w-4 h-4">
          <div className="absolute bottom-0 right-0 w-3 h-[2px] bg-[#8B2635]" />
          <div className="absolute bottom-0 right-0 w-[2px] h-3 bg-[#8B2635]" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" role="table">
          <thead>
            <tr
              style={{
                background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.15) 0%, transparent 100%)',
              }}
            >
              {/* Mobile: Single column header */}
              <th
                scope="col"
                className="w-full md:w-[45%] p-3 md:p-4 text-left"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  borderBottom: '2px solid #D4A574',
                }}
              >
                <span className="text-xs md:text-sm font-semibold tracking-wide uppercase" style={{ color: '#8B2635' }}>
                  {t.jobTitle}
                </span>
              </th>
              {/* Desktop only columns */}
              <th
                scope="col"
                className="w-[25%] p-4 text-left hidden md:table-cell"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  borderBottom: '2px solid #D4A574',
                }}
              >
                <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#2D5A3D' }}>
                  {t.company}
                </span>
              </th>
              <th
                scope="col"
                className="w-[15%] p-4 text-left hidden md:table-cell"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  borderBottom: '2px solid #D4A574',
                }}
              >
                <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#6B4423' }}>
                  {t.published}
                </span>
              </th>
              <th
                scope="col"
                className="w-[15%] p-4 text-left hidden md:table-cell"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  borderBottom: '2px solid #D4A574',
                }}
              >
                <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#8B2635' }}>
                  {t.deadline}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonCount }).map((_, index) => (
                <JobRowSkeleton key={`skeleton-${index}`} />
              ))
            ) : jobs.length > 0 ? (
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
    </div>
  );
}

export default JobTable;
