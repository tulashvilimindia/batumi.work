/**
 * SimilarJobs Component - V5 Feature
 * Display similar jobs based on category/region
 */

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateShort, getFreshnessLevel } from '@/lib/date';
import { JobFreshnessBadge } from './JobFreshnessBadge';
import { useJobs } from '@/hooks';
import type { Job } from '@/types';
import type { Language } from '@/components/ui';

const translations = {
  ge: {
    title: 'მსგავსი ვაკანსიები',
    viewAll: 'ყველა ნახვა',
    noSimilar: 'მსგავსი ვაკანსიები არ მოიძებნა',
  },
  en: {
    title: 'Similar Jobs',
    viewAll: 'View All',
    noSimilar: 'No similar jobs found',
  },
};

export interface SimilarJobsProps {
  currentJob: Job;
  className?: string;
}

export function SimilarJobs({ currentJob, className }: SimilarJobsProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Fetch similar jobs based on category
  const { data: jobsData, isLoading } = useJobs({
    category: currentJob.category_id?.toString(),
    limit: 6,
  });

  // Filter out current job and limit to 4
  const similarJobs = (jobsData?.items || [])
    .filter((job) => job.id !== currentJob.id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className={cn('mt-8', className)}>
        <div className="h-6 w-40 bg-[rgba(212,165,116,0.2)] rounded animate-pulse mb-4" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg animate-pulse"
              style={{ background: 'rgba(212, 165, 116, 0.1)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (similarJobs.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('mt-8 p-4 md:p-6 rounded-lg', className)}
      style={{
        background: 'rgba(245, 230, 211, 0.3)',
        border: '1px solid rgba(212, 165, 116, 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold text-base md:text-lg"
          style={{ fontFamily: 'Playfair Display, serif', color: '#3D2914' }}
        >
          {t.title}
        </h3>
        <Link
          to={`/${lang}?category=${currentJob.category_id}`}
          className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
          style={{ color: '#2D5A3D' }}
        >
          {t.viewAll}
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Similar Jobs List */}
      <div className="grid gap-3">
        {similarJobs.map((job) => {
          const title = lang === 'en' ? job.title_en : job.title_ge;
          const freshnessLevel = getFreshnessLevel(job.published_at);
          const showFreshness = freshnessLevel !== 'normal';

          return (
            <Link
              key={job.id}
              to={`/${lang}/job/${job.external_id}`}
              className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:translate-x-1"
              style={{
                background: '#FFFAF5',
                border: '1px solid rgba(212, 165, 116, 0.3)',
              }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded"
                style={{
                  background: 'rgba(139, 38, 53, 0.1)',
                  border: '1px solid rgba(139, 38, 53, 0.2)',
                }}
              >
                <Briefcase size={14} style={{ color: '#8B2635' }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-sm font-medium line-clamp-1"
                    style={{ color: '#3D2914' }}
                  >
                    {title}
                  </p>
                  {showFreshness && (
                    <JobFreshnessBadge publishedAt={job.published_at} compact />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: '#6B4423' }}>
                    {job.company_name}
                  </span>
                  <span style={{ color: '#D4A574' }}>·</span>
                  <span className="text-xs" style={{ color: '#8B6B4B' }}>
                    {formatDateShort(job.published_at, locale)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default SimilarJobs;
