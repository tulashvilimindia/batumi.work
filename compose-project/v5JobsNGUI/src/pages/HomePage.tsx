/**
 * HomePage - Adjarian Folk Edition
 * Main job listing page with traditional warm styling
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { Briefcase, Sun } from 'lucide-react';
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
    welcome: 'კეთილი იყოს თქვენი მობრძანება',
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
    welcome: 'Welcome',
  },
};

// Check if region selector is hidden (for adjara.work - always filter by Adjara)
const hideRegionSelector = import.meta.env.VITE_HIDE_REGION_SELECTOR === 'true';

export function HomePage() {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  // Get filter state from URL
  const { filters, setFilters, clearFilters, hasActiveFilters } = useFilters();

  // Force Adjara region when region selector is hidden
  const effectiveFilters = hideRegionSelector
    ? { ...filters, region: 'adjara' }
    : filters;

  // Fetch data
  const {
    data: jobsData,
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useJobs(effectiveFilters);

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

      {/* Results Count - Folk styled */}
      {jobsData && !isJobsLoading && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{
            background: 'rgba(212, 165, 116, 0.1)',
            border: '1px solid rgba(212, 165, 116, 0.3)',
          }}
        >
          <Briefcase
            size={16}
            style={{ color: '#6B4423' }}
          />
          <p
            className="text-sm font-medium"
            style={{
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#6B4423',
            }}
          >
            <span style={{ color: '#8B2635', fontWeight: 600 }}>
              {jobsData.total.toLocaleString()}
            </span>{' '}
            {t.jobsFound}
          </p>

          {/* Active indicator */}
          <div className="ml-auto flex items-center gap-2">
            <Sun
              size={14}
              style={{ color: '#D4A574' }}
            />
            <span
              className="text-[10px] font-semibold tracking-wide uppercase"
              style={{
                fontFamily: 'Source Sans Pro, sans-serif',
                color: '#D4A574',
              }}
            >
              აქტიური
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
