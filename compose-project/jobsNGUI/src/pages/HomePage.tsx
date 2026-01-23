/**
 * HomePage
 * Main job listing page with filters, table, and pagination
 */

import React from 'react';
import { useParams } from 'react-router-dom';
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
  },
};

/**
 * Format job count for display
 */
function formatJobCount(count: number, locale: 'ge' | 'en'): string {
  const label = translations[locale].jobsFound;
  return `${count.toLocaleString()} ${label}`;
}

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
    error: jobsError,
  } = useJobs(filters);

  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: regions = [], isLoading: isRegionsLoading } = useRegions();

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters({ page });
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle job click for analytics
  const handleJobClick = (job: { id: number }, index: number) => {
    // Analytics tracking could be added here
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

      {/* Results Count */}
      {jobsData && !isJobsLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {formatJobCount(jobsData.total, locale)}
          </p>
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
