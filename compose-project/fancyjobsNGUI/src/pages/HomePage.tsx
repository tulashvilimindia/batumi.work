/**
 * HomePage - Cyberpunk Neon Edition
 * Main job listing page with filters, table, and pagination
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { Database, Zap } from 'lucide-react';
import { cn } from '@/lib';
import {
  ErrorState,
  EmptyState,
  Pagination,
  MobilePagination,
} from '@/components/ui';
import {
  JobTable,
  FilterBar,
} from '@/components/job';
import {
  useJobs,
  useCategories,
  useRegions,
  useFilters,
} from '@/hooks';
import type { Language } from '@/components/ui';

// Translations
const translations = {
  ge: {
    jobsFound: 'ვაკანსია',
    noJobsFound: 'ვაკანსია ვერ მოიძებნა',
    noJobsDescription: 'სცადეთ ძიების პარამეტრების შეცვლა',
    clearFilters: 'ფილტრების გასუფთავება',
    browseAll: 'ყველას ნახვა',
    errorTitle: 'შეცდომა',
    errorDescription: 'ვაკანსიების ჩატვირთვა ვერ მოხერხდა',
    retry: 'ხელახლა ცდა',
    dataStream: 'მონაცემთა ნაკადი',
  },
  en: {
    jobsFound: 'jobs found',
    noJobsFound: 'No jobs found',
    noJobsDescription: 'Try adjusting your search or filters',
    clearFilters: 'Clear Filters',
    browseAll: 'Browse All Jobs',
    errorTitle: 'Error',
    errorDescription: 'Could not load jobs',
    retry: 'Try Again',
    dataStream: 'DATA STREAM',
  },
};

export function HomePage() {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Get filter state from URL
  const { filters, setFilters, clearFilters, hasActiveFilters } = useFilters();

  // Fetch data
  const {
    data: jobsData,
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useJobs(filters);

  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: regions = [], isLoading: isRegionsLoading } = useRegions();

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle job click for analytics
  const handleJobClick = (job: { id: string }, index: number) => {
    console.log('Job clicked:', job.id, 'at position:', index);
  };

  // Determine loading state
  const isFiltersLoading = isCategoriesLoading || isRegionsLoading;

  return (
    <div className={cn('space-y-6')}>
      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        categories={categories}
        regions={regions}
        isLoading={isFiltersLoading}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results Count - Cyberpunk styled */}
      {jobsData && !isJobsLoading && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(15, 15, 25, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Database
            size={16}
            style={{
              color: '#00F5FF',
              filter: 'drop-shadow(0 0 5px rgba(0, 245, 255, 0.5))',
            }}
          />
          <p
            className="text-sm font-medium"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              color: '#A0A0B0',
            }}
          >
            <span
              style={{
                color: '#00F5FF',
                textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
              }}
            >
              {jobsData.total.toLocaleString()}
            </span>{' '}
            {t.jobsFound}
          </p>

          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-2">
            <Zap
              size={12}
              className="animate-pulse"
              style={{
                color: '#39FF14',
                filter: 'drop-shadow(0 0 3px rgba(57, 255, 20, 0.8))',
              }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                color: '#39FF14',
                textShadow: '0 0 8px rgba(57, 255, 20, 0.5)',
              }}
            >
              LIVE
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {isJobsError && (
        <ErrorState
          title={t.errorTitle}
          description={t.errorDescription}
          retry={() => window.location.reload()}
        />
      )}

      {/* Job Table */}
      {!isJobsError && (
        <>
          <JobTable
            jobs={jobsData?.items ?? []}
            isLoading={isJobsLoading}
            skeletonCount={10}
            onJobClick={handleJobClick}
          />

          {/* Empty State */}
          {!isJobsLoading && jobsData && jobsData.items.length === 0 && (
            <EmptyState
              title={t.noJobsFound}
              description={t.noJobsDescription}
              action={
                hasActiveFilters
                  ? {
                      label: t.clearFilters,
                      onClick: clearFilters,
                    }
                  : undefined
              }
              secondaryAction={
                hasActiveFilters
                  ? {
                      label: t.browseAll,
                      onClick: clearFilters,
                    }
                  : undefined
              }
            />
          )}

          {/* Pagination */}
          {jobsData && jobsData.pages > 1 && (
            <>
              {/* Desktop Pagination */}
              <div className="hidden md:block">
                <Pagination
                  currentPage={filters.page ?? 1}
                  totalPages={jobsData.pages}
                  onPageChange={handlePageChange}
                  className="mt-6"
                />
              </div>

              {/* Mobile Pagination */}
              <div className="md:hidden">
                <MobilePagination
                  currentPage={filters.page ?? 1}
                  totalPages={jobsData.pages}
                  onPageChange={handlePageChange}
                  className="mt-6"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
