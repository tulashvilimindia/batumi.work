/**
 * JobTable Component - Cyberpunk Neon Edition
 * Glassmorphic table with neon accents and glow effects
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
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
    jobTitle: 'განცხადება',
    company: 'კომპანია',
    published: 'გამოქვეყნდა',
    deadline: 'ბოლო ვადა',
  },
  en: {
    jobTitle: 'Position',
    company: 'Company',
    published: 'Published',
    deadline: 'Deadline',
  },
};

function JobRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="p-4 border-b border-white/5">
        <div className="h-4 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 rounded w-3/4 mb-2" />
        <div className="flex gap-2">
          <div className="h-4 w-12 bg-neon-pink/10 rounded" />
          <div className="h-4 w-8 bg-neon-green/10 rounded" />
        </div>
      </td>
      <td className="p-4 border-b border-white/5 hidden md:table-cell">
        <div className="h-4 bg-neon-purple/10 rounded w-2/3" />
      </td>
      <td className="p-4 border-b border-white/5 hidden md:table-cell">
        <div className="h-4 bg-neon-cyan/10 rounded w-20" />
      </td>
      <td className="p-4 border-b border-white/5 hidden md:table-cell">
        <div className="h-4 bg-neon-orange/10 rounded w-20" />
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
        'relative overflow-hidden',
        'rounded-xl',
        className
      )}
      style={{
        background: 'rgba(10, 10, 20, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 245, 255, 0.15)',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(0, 245, 255, 0.02)',
      }}
    >
      {/* Top neon border glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #00F5FF, #FF006E, #8B5CF6, transparent)',
          boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-cyan rounded-tl-xl" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.5)' }} />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-pink rounded-tr-xl" style={{ boxShadow: '0 0 10px rgba(255, 0, 110, 0.5)' }} />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-purple rounded-bl-xl" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }} />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-cyan rounded-br-xl" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.5)' }} />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" role="table">
          <thead>
            <tr
              style={{
                background: 'linear-gradient(180deg, rgba(0, 245, 255, 0.08) 0%, transparent 100%)',
              }}
            >
              <th
                scope="col"
                className="w-[45%] md:w-[45%] p-4 text-left border-b border-neon-cyan/20"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                <span className="text-sm font-semibold tracking-wider uppercase text-neon-cyan">
                  {t.jobTitle}
                </span>
              </th>
              <th
                scope="col"
                className="w-[55%] md:w-[25%] p-4 text-left border-b border-neon-cyan/20"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                <span className="text-sm font-semibold tracking-wider uppercase text-neon-purple">
                  {t.company}
                </span>
              </th>
              <th
                scope="col"
                className="w-[15%] p-4 text-left border-b border-neon-cyan/20 hidden md:table-cell"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                <span className="text-sm font-semibold tracking-wider uppercase text-text-tertiary">
                  {t.published}
                </span>
              </th>
              <th
                scope="col"
                className="w-[15%] p-4 text-left border-b border-neon-cyan/20 hidden md:table-cell"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                <span className="text-sm font-semibold tracking-wider uppercase text-neon-orange">
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

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
        }}
      />
    </div>
  );
}

export default JobTable;
